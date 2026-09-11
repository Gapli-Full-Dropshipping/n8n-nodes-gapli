import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY_MS = 5_000;
const INTER_PAGE_DELAY_MS = 250;

/**
 * Limit czasu dla żądań, które czekają, aż SKLEP przyjmie towar.
 *
 * Shopify przyjmuje jeden produkt na mutację rozliczaną punktami — około
 * 30 kart na minutę na sklep — więc sufit 100 SKU na żądanie to w praktyce
 * ponad trzy minuty pracy, a przy dławieniu po stronie Shopify więcej.
 * Dziesięć minut daje zapas i nadal kończy żądanie, które naprawdę utknęło.
 */
export const STORE_SEND_TIMEOUT_MS = 600_000;

/**
 * Sufit paczki przy wysyłce produktów do sklepu — ta sama liczba, którą pilnuje API.
 * Powód jest ten sam co przy timeoucie: przepustowość sklepu, nie limit bazy.
 */
export const MAX_STORE_SKUS_PER_REQUEST = 100;

function sleep(ms: number): Promise<void> {
	// eslint-disable-next-line @n8n/community-nodes/no-restricted-globals
	return new Promise((resolve) => { const t = globalThis.setTimeout(resolve, ms); if (typeof t === 'object' && 'unref' in t) t.unref(); });
}

/**
 * Extract retry-after delay from a 429 error response.
 * Checks the response body for `rate_limit.retry_after_seconds`,
 * then falls back to `Retry-After` header, then to a default.
 */
function extractRetryDelayMs(error: unknown): number {
	try {
		const err = error as Record<string, unknown>;

		// Check response body: { rate_limit: { retry_after_seconds: N } }
		const cause = (err.cause ?? err) as Record<string, unknown>;
		const body =
			(cause.response as Record<string, unknown>)?.body ??
			(cause.error as Record<string, unknown>);
		if (body && typeof body === 'object') {
			const rateLimit = (body as Record<string, unknown>).rate_limit as
				| Record<string, unknown>
				| undefined;
			if (rateLimit?.retry_after_seconds) {
				return (Number(rateLimit.retry_after_seconds) + 1) * 1_000;
			}
		}

		// Check Retry-After header
		const headers = (cause.response as Record<string, unknown>)?.headers as
			| Record<string, string>
			| undefined;
		const retryAfterHeader =
			headers?.['retry-after'] ?? headers?.['Retry-After'];
		if (retryAfterHeader) {
			const seconds = parseInt(retryAfterHeader, 10);
			if (!isNaN(seconds) && seconds > 0) {
				return (seconds + 1) * 1_000;
			}
		}
	} catch {
		// ignore parsing errors
	}
	return DEFAULT_RETRY_DELAY_MS;
}

/**
 * Check if the error is a 429 Rate Limit error.
 */
function isRateLimitError(error: unknown): boolean {
	try {
		const err = error as Record<string, unknown>;
		if (err.httpCode === '429' || err.httpCode === 429) return true;
		const cause = (err.cause ?? err) as Record<string, unknown>;
		const statusCode =
			(cause.response as Record<string, unknown>)?.statusCode ??
			cause.statusCode;
		if (statusCode === 429) return true;
		const message = String(err.message ?? cause.message ?? '');
		if (message.includes('429') || message.includes('rate limit')) return true;
	} catch {
		// ignore
	}
	return false;
}

/**
 * Read the JSON body GAPLI returned with an error.
 *
 * Without this the workflow only ever sees n8n's canned line for the status code
 * — for a 502 that is "Bad gateway - the service failed to handle your request",
 * which says nothing about WHY the marketplace refused the call. The real reason
 * is always in the body, under `error`, and for marketplace proxies under
 * `allegro.status` / `allegro.code`.
 */
function extractApiErrorBody(error: unknown): IDataObject | null {
	try {
		const err = error as Record<string, unknown>;
		const cause = (err.cause ?? err) as Record<string, unknown>;
		const body =
			(cause.response as Record<string, unknown>)?.body ??
			(err.response as Record<string, unknown>)?.body ??
			cause.error ??
			err.error;
		if (body && typeof body === 'object') return body as IDataObject;
		if (typeof body === 'string') {
			try {
				return JSON.parse(body) as IDataObject;
			} catch {
				return null;
			}
		}
	} catch {
		// ignore
	}
	return null;
}

/** Message that tells the workflow what happened AND whether repeating it can help. */
function describeApiError(error: unknown): { message: string; description?: string } {
	const body = extractApiErrorBody(error);
	if (!body) return { message: 'GAPLI API request failed' };

	// Większość endpointów wkłada powód w `error`. Wysyłka produktów do sklepu
	// odpowiada na przekroczenie limitu HTTP 422 z pełnym wyjaśnieniem w `message`
	// („Przekroczono limit produktów dla tego sklepu. Limit: … dostępne: …") i BEZ
	// pola `error` — bez tego fallbacku przepływ dostawał „GAPLI API request failed"
	// i nie miał z czego wyczytać, że nic nie poszło z powodu limitu.
	const apiMessage =
		(typeof body.error === 'string' && body.error ? body.error : null) ??
		(typeof body.message === 'string' && body.message ? body.message : null);
	const allegro = body.allegro as IDataObject | undefined;

	const parts: string[] = [];
	if (allegro?.status) parts.push(`Allegro HTTP ${allegro.status}`);
	if (allegro?.code) parts.push(String(allegro.code));
	// Ostrzeżenia zmieniają znaczenie porażki (np. „limit przyciął paczkę o N pozycji"),
	// a przy błędzie nikt już nie przeczyta ciała odpowiedzi — więc idą w komunikat.
	if (Array.isArray(body.warnings)) {
		for (const warning of body.warnings) {
			if (typeof warning === 'string' && warning) parts.push(warning);
		}
	}
	// `retryable: false` means the marketplace refused the request itself — repeating
	// it burns the account's request budget and cannot succeed.
	if (body.retryable === false) parts.push('permanent, do not retry');
	else if (body.retryable === true) parts.push('transient, retry is allowed');

	return {
		message: apiMessage ?? 'GAPLI API request failed',
		description: parts.length > 0 ? parts.join(' · ') : undefined,
	};
}

/**
 * Make an authenticated request to the GAPLI API.
 * Includes automatic retry on 429 (Rate Limit) with exponential backoff.
 *
 * `requestOptions.timeout` podnosi limit czasu dla endpointów, które CZEKAJĄ na
 * cudzy system — wysyłka produktów do sklepu Shopify idzie jeden produkt na
 * mutację i przy 100 pozycjach trwa kilka minut. Bez tego przepływ wywraca się
 * na timeoucie i ponawia wysyłkę, która w rzeczywistości poszła.
 *
 * ⚠️ Timeout NIE jest ponawiany — celowo. Ponowienie tylko 429 jest tu jedyną
 * bezpieczną regułą: przy zerwanym oczekiwaniu nie wiemy, ile już wylądowało
 * w sklepie, a drugie żądanie zatowarowałoby go po raz drugi.
 */
export async function gapliApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	requestOptions: { timeout?: number } = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('gapliApi');
	const baseUrl = (credentials.baseUrl as string) || 'https://gapli.com';

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/api/v1/integrations${endpoint}`,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		qs,
		json: true,
	};

	if (requestOptions.timeout) {
		options.timeout = requestOptions.timeout;
	}

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		try {
			const response = await this.helpers.httpRequestWithAuthentication.call(
				this,
				'gapliApi',
				options,
			);
			return response as IDataObject;
		} catch (error) {
			// Retry on 429 Rate Limit
			if (isRateLimitError(error) && attempt < MAX_RETRIES) {
				const delayMs = extractRetryDelayMs(error);
				await sleep(delayMs);
				continue;
			}

			throw new NodeApiError(this.getNode(), error as unknown as JsonObject, describeApiError(error));
		}
	}

	// Should never reach here, but TypeScript needs a return
	throw new NodeApiError(this.getNode(), {} as JsonObject, {
		message: 'GAPLI API request failed after max retries',
	});
}

/**
 * Make an authenticated request to the GAPLI API and return all items
 * using pagination (offset-based).
 * Includes inter-page delay to avoid hitting rate limits during bulk fetches.
 * Safety: max 100 pages (50,000 items at 500/page) to prevent infinite loops.
 */
export async function gapliApiRequestAllItems(
	this: IExecuteFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	propertyName: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let offset = 0;
	const limit = 500;
	const MAX_PAGES = 100;

	let hasMore = true;
	let page = 0;

	while (hasMore && page < MAX_PAGES) {
		qs.limit = limit;
		qs.offset = offset;

		const responseData = await gapliApiRequest.call(this, method, endpoint, body, qs);

		const items = responseData[propertyName] as IDataObject[] | undefined;
		if (!items || items.length === 0) {
			// No items returned — stop pagination to prevent infinite loop
			hasMore = false;
			break;
		}
		returnData.push(...items);

		offset += items.length;
		page++;

		const pagination = responseData.pagination as IDataObject | undefined;
		if (!pagination || !(pagination.has_more as boolean)) {
			hasMore = false;
			break;
		}

		// Delay between pages to prevent rate-limit exhaustion
		await sleep(INTER_PAGE_DELAY_MS);
	}

	return returnData;
}

/**
 * Odczyt asortymentu sklepu ze stronicowaniem po `total`.
 *
 * `GET /store/products` nie zwraca bloku `pagination` — tylko `total`. Wspólny
 * `gapliApiRequestAllItems` zatrzymuje się właśnie na braku tego bloku, więc dla
 * tego endpointu oddałby pierwsze 500 pozycji z 1200 i wyglądałoby to na pełną
 * listę sklepu. Stąd własna pętla, chodząca po `total`.
 *
 * Druga różnica: `_meta` (źródło listy i wiek migawki) oraz `store` są RODZEŃSTWEM
 * listy, a nie polami pozycji. Zwracamy je razem z pozycjami, bo bez nich przepływ
 * nie ma czym odróżnić „tego nie ma w sklepie" od „migawka jest z zeszłego tygodnia".
 */
export async function gapliFetchStoreAssortment(
	this: IExecuteFunctions,
	storeId: number,
	options: { returnAll: boolean; limit: number },
): Promise<{ items: IDataObject[]; total: number; store: IDataObject; meta: IDataObject }> {
	const PAGE_SIZE = 500;
	const MAX_PAGES = 100;

	const items: IDataObject[] = [];
	let total = 0;
	let store: IDataObject = {};
	let meta: IDataObject = {};
	let offset = 0;

	const pageLimit = options.returnAll ? PAGE_SIZE : Math.min(Math.max(options.limit, 1), PAGE_SIZE);

	for (let page = 0; page < MAX_PAGES; page++) {
		const response = await gapliApiRequest.call(
			this,
			'GET',
			'/store/products',
			{},
			{ store_id: storeId, limit: pageLimit, offset },
		);

		total = Number(response.total) || 0;
		store = (response.store as IDataObject) || store;
		meta = (response._meta as IDataObject) || meta;

		const batch = (response.products as IDataObject[]) || [];
		items.push(...batch);

		// `batch.length === 0` jest tu warunkiem bezpieczeństwa, nie stylistyką:
		// bez niego rozjazd między `total` a liczbą wierszy zapętliłby odczyt.
		if (!options.returnAll || batch.length === 0 || items.length >= total) break;

		offset += batch.length;
		await sleep(INTER_PAGE_DELAY_MS);
	}

	return { items, total, store, meta };
}
