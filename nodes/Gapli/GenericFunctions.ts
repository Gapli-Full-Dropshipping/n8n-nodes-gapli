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
 * Make an authenticated request to the GAPLI API.
 * Includes automatic retry on 429 (Rate Limit) with exponential backoff.
 */
export async function gapliApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
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

			throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
				message: 'GAPLI API request failed',
			});
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
	const limit = 100;

	let hasMore = true;

	while (hasMore) {
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

		offset += limit;

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
