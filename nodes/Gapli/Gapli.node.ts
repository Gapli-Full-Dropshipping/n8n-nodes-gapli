import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { gapliApiRequest, gapliApiRequestAllItems } from './GenericFunctions';
import { productOperations, productFields } from './resources/product';
import { orderOperations, orderFields } from './resources/order';
import { messageOperations, messageFields } from './resources/message';
import { wholesalerOperations, wholesalerFields } from './resources/wholesaler';
import { marketplaceOperations, marketplaceFields } from './resources/marketplace';
import { bundleOperations, bundleFields } from './resources/bundle';
import { storeOperations, storeFields } from './resources/store';
import { industryOperations, industryFields } from './resources/industry';
import { analyticsOperations, analyticsFields } from './resources/analytics';
import { marketOperations, marketFields } from './resources/market';
import { duplicateCheckOperations, duplicateCheckFields } from './resources/duplicateCheck';
import { offerHealthOperations, offerHealthFields } from './resources/offerHealth';
import { allegroCatalogOperations, allegroCatalogFields } from './resources/allegroCatalog';
import { allegroListingOperations, allegroListingFields } from './resources/allegroListing';

export class Gapli implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GAPLI',
		name: 'gapli',
		icon: { light: 'file:../../icons/gapli.svg', dark: 'file:../../icons/gapli.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Interact with the GAPLI Dropshipping Platform — manage products, orders, wholesalers, and marketplace accounts',
		defaults: {
			name: 'GAPLI',
		},
		// Opis WIDZIANY PRZEZ MODEL, gdy node jest narzędziem agenta AI — osobny od
		// tego wyżej, który czyta człowiek w panelu węzłów.
		//
		// n8n buduje schemat narzędzia ze skanowania WARTOŚCI parametrów w poszukiwaniu
		// wywołań `$fromAI()` (n8n-workflow/from-ai-parse-utils), a nie z definicji
		// właściwości. Filtr schowany w kolekcji „Filters" jest więc dla modelu
		// NIEWIDOCZNY, dopóki autor przepływu sam go nie podepnie. Opis narzędzia to
		// jedyny tekst, który model dostaje ZAWSZE — stąd ostrzeżenie właśnie tutaj.
		usableAsTool: {
			replacements: {
				description:
					'Interact with the GAPLI Dropshipping Platform — manage products, orders, wholesalers, '
					+ 'and marketplace accounts. Product search spans the ENTIRE wholesale catalogue, '
					+ 'adult/erotic wholesalers included: a search for "toys" also returns erotic toys with '
					+ 'matching names. When sourcing by product name, set the Adult Products filter to '
					+ '"exclude" (or "only" for an adult-only catalogue); every product carries is_adult.',
			},
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'gapliApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials?.baseUrl}}/api/v1/integrations',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Allegro Catalog',
						value: 'allegroCatalog',
						description:
							'Search Allegro official product catalog by EAN or phrase, get category parameters — proxied through your Allegro account',
					},
					{
						name: 'Allegro Listing',
						value: 'allegroListing',
						description:
							'Send products to Allegro for publication — queue listings, check readiness (dry run), and monitor status',
					},
					{
						name: 'Analytics',
						value: 'analytics',
						description:
							'Sales analytics: top products, revenue summary, stock alerts, marketplace health',
					},
					{
						name: 'Bundle',
						value: 'bundle',
						description:
							'Allegro flexible bundles (/sale/flexible-bundles): read across all accounts, create, edit, change the discount',
					},
					{
						name: 'Duplicate Check',
						value: 'duplicateCheck',
						description:
							'Check if a product is already listed on your Allegro accounts using SKU, EAN, or name matching',
					},
					{
						name: 'Health',
						value: 'health',
						description: 'Check the GAPLI API status',
					},
					{
						name: 'Industry',
						value: 'industry',
						description: 'View available industries/categories for marketing filtering',
					},
					{
						name: 'Market',
						value: 'market',
						description: 'View available markets/regions with country flags and currencies',
					},
					{
						name: 'Marketplace',
						value: 'marketplace',
						description:
							'Manage marketplace accounts (Allegro, Erli) and their products',
					},
					{
						name: 'Message',
						value: 'message',
						description:
							'Read buyer conversations, disputes and claims (read-only, requires the "messages" scope)',
					},
					{
						name: 'Offer Health',
						value: 'offerHealth',
						description:
							'Analyze data completeness and quality of your Allegro offers (health score 0-100)',
					},
					{
						name: 'Order',
						value: 'order',
						description: 'Manage customer orders',
					},
					{
						name: 'Product',
						value: 'product',
						description: 'Manage products from your catalog',
					},
					{
						name: 'Store',
						value: 'store',
						description:
							'View your connected online stores (WooCommerce, PrestaShop, etc.)',
					},
					{
						name: 'Wholesaler',
						value: 'wholesaler',
						description: 'View available wholesalers and suppliers',
					},
				],
				default: 'product',
			},
			// Health — no operation needed
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'hidden',
				default: 'check',
				displayOptions: {
					show: {
						resource: ['health'],
					},
				},
			},
			// Resource operations and fields
			...productOperations,
			...productFields,
			...orderOperations,
			...orderFields,
			...messageOperations,
			...messageFields,
			...wholesalerOperations,
			...wholesalerFields,
			...marketplaceOperations,
			...marketplaceFields,
			...bundleOperations,
			...bundleFields,
			...storeOperations,
			...storeFields,
			...industryOperations,
			...industryFields,
			...analyticsOperations,
			...analyticsFields,
			...marketOperations,
			...marketFields,
			...duplicateCheckOperations,
			...duplicateCheckFields,
			...offerHealthOperations,
			...offerHealthFields,
			...allegroCatalogOperations,
			...allegroCatalogFields,
			...allegroListingOperations,
			...allegroListingFields,
		],
	};

	methods = {
		loadOptions: {
			async getWholesalers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				try {
					const response = await gapliApiRequest.call(this, 'GET', '/wholesalers', {}, { active: 'true' });
					const wholesalers = (response.wholesalers as IDataObject[]) || [];

					// Add "All Wholesalers" option at the top
					returnData.push({
						name: '— All Wholesalers —',
						value: 0,
						description: 'Search across all available wholesaler catalogs',
					});

					for (const w of wholesalers) {
						const parserId = w.parser_id as number;
						if (parserId) {
							returnData.push({
								name: w.name as string,
								value: parserId,
								description: `Parser ID: ${parserId}`,
							});
						}
					}
				} catch {
					// Fallback — allow manual entry if API fails
					returnData.push({
						name: '— All Wholesalers —',
						value: 0,
					});
				}
				return returnData;
			},

			async getMarkets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				try {
					const response = await gapliApiRequest.call(this, 'GET', '/markets');
					const markets = (response.markets as IDataObject[]) || [];

					// Add "All Markets" option at the top
					returnData.push({
						name: '🌍 — All Markets —',
						value: 0,
						description: 'No market filter — return data from all regions',
					});

					for (const m of markets) {
						const marketId = m.id as number;
						const name = m.name as string;
						const flag = (m.flag as string) || '🏳️';
						const currency = m.currency as string;
						if (marketId) {
							returnData.push({
								name: `${flag} ${name}`,
								value: marketId,
								description: `Market ID: ${marketId} · Currency: ${currency}`,
							});
						}
					}
				} catch {
					// Fallback — allow manual entry if API fails
					returnData.push({
						name: '🌍 — All Markets —',
						value: 0,
					});
				}
				return returnData;
			},

			async getAllegroAccounts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				try {
					const response = await gapliApiRequest.call(this, 'GET', '/marketplace/accounts');
					const accounts = (response.accounts as IDataObject[]) || [];

					for (const a of accounts) {
						const platform = a.platform as string;
						if (platform !== 'allegro') continue;

						const id = a.id as number;
						const accountName = a.name as string;
						const allegroLogin = (a.allegro_login as string) || accountName;
						const storeName = (a.store_name as string) || '—';
						const isActive = a.is_active as boolean;
						const isSandbox = a.is_sandbox as boolean;

						const statusBadge = isActive ? '🟢' : '🔴';
						const sandboxBadge = isSandbox ? ' [SANDBOX]' : '';

						returnData.push({
							name: `${statusBadge} ${allegroLogin}${sandboxBadge} (${storeName})`,
							value: id,
							description: `Account ID: ${id} · Login: ${allegroLogin} · Store: ${storeName}`,
						});
					}

					if (returnData.length === 0) {
						returnData.push({
							name: '⚠️ No Allegro accounts found',
							value: 0,
							description: 'Connect an Allegro account in your GAPLI dashboard first',
						});
					}
				} catch {
					returnData.push({
						name: '⚠️ Could not load accounts — enter ID manually',
						value: 0,
						description: 'API error — use the number field below instead',
					});
				}
				return returnData;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				// ─── Product ────────────────────────────────────────────
				if (resource === 'product') {
					if (operation === 'get') {
						const sku = this.getNodeParameter('sku', i) as string;
						try {
							const response = await gapliApiRequest.call(
								this,
								'GET',
								`/products/${encodeURIComponent(sku)}`,
							);
							responseData = (response.product as IDataObject) || response;
						} catch (error) {
							// Handle 404 gracefully - product may have been removed
							const err = error as Record<string, unknown>;
							const statusCode =
								err.httpCode ??
								(err.cause as Record<string, unknown> | undefined)?.statusCode;
							if (
								statusCode === 404 ||
								statusCode === '404' ||
								String(err.message ?? '').includes('404')
							) {
								responseData = {
									sku,
									found: false,
									error: 'Product not found in catalog - may have been removed by wholesaler',
								};
							} else {
								throw error;
							}
						}
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const marketId = this.getNodeParameter('marketId', i, 0) as number;
						const qs: IDataObject = {};

						// Market filter
						if (marketId > 0) qs.market_id = marketId;

						if (filters.parser_id) qs.parser_id = filters.parser_id;
						if (filters.sku) qs.sku = filters.sku;
						if (filters.search) qs.search = filters.search;
						if (filters.ean) qs.ean = filters.ean;
						if (filters.available) qs.available = 'true';
						if (filters.stock_min) qs.stock_min = filters.stock_min;
						if (filters.price_gross_min) qs.price_gross_min = filters.price_gross_min;
						if (filters.price_gross_max) qs.price_gross_max = filters.price_gross_max;
						if (filters.exclude_oversized) qs.exclude_oversized = 'true';
						if (filters.adult && filters.adult !== 'include') qs.adult = filters.adult;
						if (filters.has_ean) qs.has_ean = 'true';
						if (filters.exclude_parser_ids) qs.exclude_parser_ids = filters.exclude_parser_ids;
						if (filters.exclude_already_listed_on_accounts)
							qs.exclude_already_listed_on_accounts = filters.exclude_already_listed_on_accounts;

						if (returnAll) {
							// Check if Full Database Scan is enabled
							const scanAll = this.getNodeParameter('scanAll', i, false) as boolean;

						if (scanAll) {
							qs.scan_all = 'true';

							// Read maxItems safety cap (default 5000)
							const maxItems = this.getNodeParameter('maxItems', i, 5000) as number;

							// ── Parser-first pagination ──────────────────────────
							// Step 1: Get parsers summary (list of parsers with counts)
							const summaryQs = { ...qs, scan_mode: 'parsers_summary' };
							const summaryResponse = await gapliApiRequest.call(
								this,
								'GET',
								'/products',
								{},
								summaryQs,
							);
							const parsers = (summaryResponse.parsers as IDataObject[]) || [];
							const summaryMeta = summaryResponse._meta as IDataObject | undefined;

							const allProducts: IDataObject[] = [];
							const PER_PAGE = 5000;
	

							// Step 2: Iterate each parser page-by-page (respecting maxItems)
							for (const parser of parsers) {
								if (allProducts.length >= maxItems) break;

								const parserId = parser.parser_id as number;
								const totalFiltered = parser.total_filtered as number;

								if (!totalFiltered || totalFiltered === 0) continue;

								let page = 1;
								let hasMore = true;

								while (hasMore && allProducts.length < maxItems) {
									const pageQs: IDataObject = {
										...qs,
										parser_id: parserId,
										page,
										per_page: Math.min(PER_PAGE, maxItems - allProducts.length),
									};
									delete pageQs.scan_mode;

									const pageResponse = await gapliApiRequest.call(
										this,
										'GET',
										'/products',
										{},
										pageQs,
									);
									const pageProducts = (pageResponse.products as IDataObject[]) || [];
									allProducts.push(...pageProducts);

									const pageMeta = pageResponse._meta as IDataObject | undefined;
									hasMore = (pageMeta?.has_more as boolean) || false;
									page++;
								}
							}

							// Trim to maxItems if exceeded
							const finalProducts = allProducts.slice(0, maxItems);

							// Attach summary meta + maxItems info to each product for downstream auditing
							const scanMetaObj: IDataObject = {
								...(summaryMeta || {}),
								returned_count: finalProducts.length,
								max_items_applied: maxItems,
								truncated_by_max_items: allProducts.length > maxItems,
								scan_mode: 'FULL_DATABASE_SCAN',
							};
							for (const product of finalProducts) {
								product._meta = scanMetaObj;
							}
							responseData = finalProducts;
							} else {
								// Standard pagination — iterate pages
								responseData = await gapliApiRequestAllItems.call(
									this,
									'GET',
									'/products',
									'products',
									{},
									qs,
								);
							}
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							const offset = Number(this.getNodeParameter('offset', i, 0)) || 0;
							qs.limit = limit;
							qs.offset = offset;
							const response = await gapliApiRequest.call(
								this,
								'GET',
								'/products',
								{},
								qs,
							);
							const products = (response.products as IDataObject[]) || [];

							// Attach pagination metadata so downstream nodes know if results are truncated
							const pagination = response.pagination as IDataObject | undefined;
							const excludeMeta = response._exclude_meta as IDataObject | undefined;
							const metaObj: IDataObject = {
								scan_mode: 'NORMAL_LIMITED',
								returned_count: products.length,
								limit_applied: limit,
								offset_applied: offset,
								...(pagination ? {
									total_matching_count: pagination.total,
									has_more: pagination.has_more,
								} : {}),
								...(excludeMeta ? { _exclude_meta: excludeMeta } : {}),
							};
							for (const product of products) {
								product._meta = metaObj;
							}
							responseData = products;
						}
					} else if (operation === 'batchEan') {
						const eanInput = this.getNodeParameter('eanCodes', i) as string;
						const marketId = this.getNodeParameter('marketId', i, 0) as number;

						// Parse textarea/comma input into array
						const eans = eanInput
							.split(/[\n,]+/)
							.map((s) => s.trim())
							.filter(Boolean);

						if (eans.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'No EAN codes provided. Enter at least one EAN code.',
								{ itemIndex: i },
							);
						}
						if (eans.length > 100) {
							throw new NodeOperationError(
								this.getNode(),
								`Too many EAN codes (${eans.length}). Maximum is 100 per request.`,
								{ itemIndex: i },
							);
						}

						const body: IDataObject = { eans };
						if (marketId > 0) body.market_id = marketId;

						const response = await gapliApiRequest.call(
							this,
							'POST',
							'/products/batch-ean',
							body,
						);
						responseData = (response as IDataObject) || {};
					} else if (operation === 'batchSku') {
						const skuInput = this.getNodeParameter('skuCodes', i) as string;
						const marketId = this.getNodeParameter('marketId', i, 0) as number;

						// Parse textarea/comma input into array
						const skus = skuInput
							.split(/[\n,]+/)
							.map((s) => s.trim())
							.filter(Boolean);

						if (skus.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'No SKU codes provided. Enter at least one SKU.',
								{ itemIndex: i },
							);
						}
						if (skus.length > 100) {
							throw new NodeOperationError(
								this.getNode(),
								`Too many SKU codes (${skus.length}). Maximum is 100 per request.`,
								{ itemIndex: i },
							);
						}

						const body: IDataObject = { skus };
						if (marketId > 0) body.market_id = marketId;

						const response = await gapliApiRequest.call(
							this,
							'POST',
							'/products/batch-sku',
							body,
						);
						responseData = (response as IDataObject) || {};
					} else if (operation === 'lookupByEan') {
						const eanCode = this.getNodeParameter('eanCode', i) as string;
						const marketId = this.getNodeParameter('marketId', i, 0) as number;

						if (!eanCode.trim()) {
							throw new NodeOperationError(
								this.getNode(),
								'No EAN/GTIN code provided. Enter a valid barcode.',
								{ itemIndex: i },
							);
						}

						const body: IDataObject = { eans: [eanCode.trim()] };
						if (marketId > 0) body.market_id = marketId;

						const response = await gapliApiRequest.call(
							this,
							'POST',
							'/products/batch-ean',
							body,
						);

						const matched = (response.matched as IDataObject[]) || [];
						if (matched.length > 0) {
							// Return first matched product with lookup metadata
							responseData = {
								...matched[0],
								_lookup: {
									method: 'EAN_EXACT',
									query: eanCode.trim(),
									match_status: 'MATCHED',
								},
							};
						} else {
							// Return a NO_MATCH result so downstream nodes can handle it
							responseData = {
								ean: eanCode.trim(),
								match_status: 'NO_MATCH',
								_lookup: {
									method: 'EAN_EXACT',
									query: eanCode.trim(),
									match_status: 'NO_MATCH',
									reason: `No product found with EAN = ${eanCode.trim()}`,
								},
							};
						}
					} else if (operation === 'getAlreadyListedEvidence') {
						const skuInput = this.getNodeParameter('evidenceSkus', i) as string;
						const accountIdsInput = this.getNodeParameter('evidenceAccountIds', i) as string;

						// Parse SKUs
						const skus = skuInput
							.split(/[\n,]+/)
							.map((s) => s.trim())
							.filter(Boolean);

						if (skus.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'No SKU codes provided. Enter at least one SKU.',
								{ itemIndex: i },
							);
						}
						if (skus.length > 500) {
							throw new NodeOperationError(
								this.getNode(),
								`Too many SKU codes (${skus.length}). Maximum is 500 per request.`,
								{ itemIndex: i },
							);
						}

						// Parse account IDs
						const accountIds = accountIdsInput
							.split(/[\n,]+/)
							.map((s) => parseInt(s.trim(), 10))
							.filter((n) => !isNaN(n));

						if (accountIds.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'No Allegro account IDs provided. Use Marketplace → Get Accounts to find your IDs.',
								{ itemIndex: i },
							);
						}

						const body: IDataObject = { skus, account_ids: accountIds };

						const response = await gapliApiRequest.call(
							this,
							'POST',
							'/products/already-listed-evidence',
							body,
						);
						responseData = (response as IDataObject) || {};
					} else if (operation === 'assessSellability') {
						const skuInput = this.getNodeParameter('sellabilitySkus', i) as string;
						const accountId = Number(this.getNodeParameter('sellabilityAccountId', i, 0));

						// Parse SKUs
						const skus = skuInput
							.split(/[\n,]+/)
							.map((s) => s.trim())
							.filter(Boolean);

						if (skus.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'No SKU codes provided. Enter at least one SKU.',
								{ itemIndex: i },
							);
						}
						if (skus.length > 100) {
							throw new NodeOperationError(
								this.getNode(),
								`Too many SKU codes (${skus.length}). Maximum is 100 per request.`,
								{ itemIndex: i },
							);
						}

						const body: IDataObject = { skus };
						if (accountId > 0) body.account_ids = [accountId];

						const response = await gapliApiRequest.call(
							this,
							'POST',
							'/products/batch-sellability',
							body,
						);
						responseData = (response as IDataObject) || {};
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i },
						);
					}
				}

				// ─── Order ──────────────────────────────────────────────
				else if (resource === 'order') {
					if (operation === 'get') {
						const orderId = this.getNodeParameter('orderId', i) as number;
						const include = this.getNodeParameter('include', i, []) as string[];
						const qs: IDataObject = {};

						if (include.length > 0) {
							qs.include = include.join(',');
							if (include.includes('conversation')) {
								qs.include_automated = this.getNodeParameter(
									'includeAutomated',
									i,
									false,
								) as boolean;
							}
						}

						const response = await gapliApiRequest.call(
							this,
							'GET',
							`/orders/${orderId}`,
							{},
							qs,
						);

						// Bloki `conversation`, `diagnostics` i `financials` są RODZEŃSTWEM
						// `order` w odpowiedzi, a nie jego polami. Zwrócenie samego
						// `response.order` po cichu by je gubiło — dlatego doklejamy je do wyniku.
						const order = (response.order as IDataObject) || response;
						responseData = {
							...order,
							...(response.conversation
								? { conversation: response.conversation }
								: {}),
							...(response.diagnostics ? { diagnostics: response.diagnostics } : {}),
							...(response.financials ? { financials: response.financials } : {}),
						};
					} else if (operation === 'getAnalysis') {
						const orderId = this.getNodeParameter('orderId', i) as number;
						const refresh = this.getNodeParameter('refresh', i, false) as boolean;
						const qs: IDataObject = {};
						if (refresh) qs.refresh = true;

						const response = await gapliApiRequest.call(
							this,
							'GET',
							`/orders/${orderId}/analysis`,
							{},
							qs,
						);
						responseData = (response.analysis as IDataObject) || response;
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = {};

						if (filters.status) qs.status = filters.status;
						if (filters.from) qs.from = filters.from;
						if (filters.to) qs.to = filters.to;

						// Wynik finansowy i wniosek z rozmowy doklejają się do KAŻDEGO
						// zamówienia na stronie jednym żądaniem — dlatego to przełączniki
						// przy liście, a nie operacje per zamówienie.
						const listIncludes: string[] = [];
						if (this.getNodeParameter('includeFinancials', i, false) as boolean) {
							listIncludes.push('financials');
						}
						if (this.getNodeParameter('includeAnalysis', i, false) as boolean) {
							listIncludes.push('analysis');
						}
						if (listIncludes.length > 0) {
							qs.include = listIncludes.join(',');
						}

						if (returnAll) {
							responseData = await gapliApiRequestAllItems.call(
								this,
								'GET',
								'/orders',
								'orders',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.offset = 0;
							const response = await gapliApiRequest.call(
								this,
								'GET',
								'/orders',
								{},
								qs,
							);
							responseData = (response.orders as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i },
						);
					}
				}

				// ─── Message (rozmowy, spory, reklamacje) ────────────────
				else if (resource === 'message') {
					const includeAutomated = this.getNodeParameter(
						'includeAutomated',
						i,
						false,
					) as boolean;

					if (operation === 'getThread') {
						const threadId = this.getNodeParameter('threadId', i) as number;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							`/messages/threads/${threadId}`,
							{},
							{ include_automated: includeAutomated },
						);
						responseData = (response.thread as IDataObject) || response;
					} else if (operation === 'getAllThreads') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = { include_automated: includeAutomated };

						// Zera i puste stringi to „brak filtra", nie wartość —
						// wysłanie order_id=0 zwróciłoby pustą listę.
						if (filters.order_id) qs.order_id = filters.order_id;
						if (filters.source_order_id) qs.source_order_id = filters.source_order_id;
						if (filters.thread_type) qs.thread_type = filters.thread_type;
						if (filters.platform) qs.platform = filters.platform;
						if (filters.account_id) qs.account_id = filters.account_id;
						if (filters.from) qs.from = filters.from;
						if (filters.to) qs.to = filters.to;

						if (returnAll) {
							responseData = await gapliApiRequestAllItems.call(
								this,
								'GET',
								'/messages/threads',
								'threads',
								{},
								qs,
							);
						} else {
							qs.limit = this.getNodeParameter('limit', i) as number;
							qs.offset = 0;
							const response = await gapliApiRequest.call(
								this,
								'GET',
								'/messages/threads',
								{},
								qs,
							);
							responseData = (response.threads as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i },
						);
					}
				}

				// ─── Wholesaler ──────────────────────────────────────────
				else if (resource === 'wholesaler') {
					const activeOnly = this.getNodeParameter('activeOnly', i, true) as boolean;
					const marketId = this.getNodeParameter('marketId', i, 0) as number;
					const qs: IDataObject = { active: activeOnly ? 'true' : 'false' };
					if (marketId > 0) qs.market_id = marketId;
					const response = await gapliApiRequest.call(
						this,
						'GET',
						'/wholesalers',
						{},
						qs,
					);
					responseData = (response.wholesalers as IDataObject[]) || [];
				}

				// ─── Marketplace ─────────────────────────────────────────
				else if (resource === 'marketplace') {
					if (operation === 'getAccounts') {
						const marketId = this.getNodeParameter('marketId', i, 0) as number;
						const qs: IDataObject = {};
						if (marketId > 0) qs.market_id = marketId;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/marketplace/accounts',
							{},
							qs,
						);
						responseData = (response.accounts as IDataObject[]) || [];
					} else if (operation === 'getProducts') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = {};

						if (filters.account_id) qs.account_id = filters.account_id;
						if (filters.platform) qs.platform = filters.platform;
						if (filters.status) qs.status = filters.status;

						// Zawężenia katalogowe — odsiew po stronie GAPLI zamiast ściągania
						// wszystkich ofert konta i filtrowania ich w przepływie.
						if (filters.parser_id) qs.parser_id = filters.parser_id;
						if (filters.wholesaler_id) qs.wholesaler_id = filters.wholesaler_id;
						if (filters.category_id) qs.category_id = filters.category_id;
						if (filters.updated_since) qs.updated_since = filters.updated_since;
						// Zero jest wartością DOMYŚLNĄ pola liczbowego, nie wyborem
						// użytkownika — wysłanie go zawężałoby wynik bez jego wiedzy.
						if (Number(filters.stock_min) > 0) qs.stock_min = filters.stock_min;
						if (Number(filters.price_min) > 0) qs.price_min = filters.price_min;
						if (Number(filters.price_max) > 0) qs.price_max = filters.price_max;

						if (returnAll) {
							responseData = await gapliApiRequestAllItems.call(
								this,
								'GET',
								'/marketplace/products',
								'products',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.offset = 0;
							const response = await gapliApiRequest.call(
								this,
								'GET',
								'/marketplace/products',
								{},
								qs,
							);
							responseData = (response.products as IDataObject[]) || [];
						}
					} else if (operation === 'getWholesalerCoverage') {
						const coverageAccountId = Number(this.getNodeParameter('coverageAccountId', i, 0));
						const output = this.getNodeParameter('coverageOutput', i, 'flat') as string;
						const qs: IDataObject = {};
						if (coverageAccountId > 0) qs.account_id = coverageAccountId;

						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/marketplace/wholesaler-coverage',
							{},
							qs,
						);

						const accounts = (response.accounts as IDataObject[]) || [];

						if (output === 'byWholesaler') {
							responseData = (response.by_wholesaler as IDataObject[]) || [];
						} else if (output === 'byAccount') {
							responseData = accounts;
						} else {
							// Flat: one row per account × wholesaler — the shape a spreadsheet wants
							const rows: IDataObject[] = [];
							for (const entry of accounts) {
								const account = (entry.account as IDataObject) || {};
								const wholesalers = (entry.wholesalers as IDataObject[]) || [];
								for (const w of wholesalers) {
									rows.push({
										account_id: account.id,
										account_name: account.name,
										allegro_login: account.allegro_login,
										account_status: account.status,
										store_name: account.store_name,
										parser_id: w.parser_id,
										wholesaler_id: w.wholesaler_id,
										wholesaler_name: w.name,
										products_count: w.products_count,
										active_offers_count: w.active_offers_count,
										ended_offers_count: w.ended_offers_count,
										unpublished_count: w.unpublished_count,
										in_progress_count: w.in_progress_count,
										other_count: w.other_count,
									});
								}
							}
							responseData = rows;
						}
					} else if (
						operation === 'searchOffersBySku' ||
						operation === 'searchOffersByEan' ||
						operation === 'searchOffersByName'
					) {
						const searchQuery = this.getNodeParameter('offerSearchQuery', i) as string;
						const limit = this.getNodeParameter('limit', i, 50) as number;
						const accountId = Number(this.getNodeParameter('offerAccountId', i, 0));

						if (!searchQuery.trim()) {
							throw new NodeOperationError(
								this.getNode(),
								'Search query is empty. Please provide a value to search for.',
								{ itemIndex: i },
							);
						}

						// Map operation to search mode
						const modeMap: Record<string, string> = {
							searchOffersBySku: 'sku',
							searchOffersByEan: 'ean',
							searchOffersByName: 'name',
						};
						const mode = modeMap[operation] || 'sku';

						const qs: IDataObject = {
							mode,
							q: searchQuery.trim(),
							limit,
						};
						if (accountId > 0) qs.account_id = accountId;

						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/marketplace/offers',
							{},
							qs,
						);

						// Return offers array — each item includes _search metadata from API
						const offers = (response.offers as IDataObject[]) || [];
						const searchMeta = response.search as IDataObject | undefined;

						// Attach search summary to results for downstream auditing
						if (offers.length > 0) {
							responseData = offers;
						} else {
							// Return a structured NO_RESULTS response
							responseData = {
								match_status: 'NO_RESULTS',
								search: searchMeta || { mode, query: searchQuery.trim() },
								message: `No offers found for ${mode.toUpperCase()} = "${searchQuery.trim()}"`,
							};
						}
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i },
						);
					}
				}

				// ─── Bundle (zestawy elastyczne Allegro) ─────────────────
				else if (resource === 'bundle') {
					if (operation === 'getAll') {
						const accountId = Number(this.getNodeParameter('bundleAccountId', i, 0));
						const hydrate = this.getNodeParameter('bundleHydrate', i, false) as boolean;
						const limit = this.getNodeParameter('limit', i, 50) as number;
						const options = this.getNodeParameter('bundleListOptions', i, {}) as IDataObject;

						const qs: IDataObject = { limit };
						if (accountId > 0) qs.account_id = accountId;
						if (hydrate) qs.hydrate = true;
						if (options.offer_id) qs.offer_id = options.offer_id;
						if (options.cursor) {
							if (accountId <= 0) {
								throw new NodeOperationError(
									this.getNode(),
									'Cursor paging needs an Allegro account: the cursor Allegro returns is only valid within one account.',
									{ itemIndex: i },
								);
							}
							qs.cursor = options.cursor;
						}

						const response = await gapliApiRequest.call(this, 'GET', '/marketplace/bundles', {}, qs);
						const bundles = (response.bundles as IDataObject[]) || [];

						// Konta, które odpowiedziały błędem, nie mogą zniknąć: bez tego
						// przepływ widzi krótszą listę i nie ma jak odróżnić „brak zestawów"
						// od „konto nie odpowiedziało".
						const accounts = (response.accounts as IDataObject[]) || [];
						const failed = accounts.filter((a) => a.error);
						if (bundles.length === 0 && failed.length > 0) {
							throw new NodeOperationError(
								this.getNode(),
								`No bundles returned; ${failed.length} account(s) failed: ${failed
									.map((a) => `${a.allegro_login || a.account_id}: ${a.error}`)
									.join(' | ')}`,
								{ itemIndex: i },
							);
						}

						responseData = bundles.map((bundle) => ({
							...bundle,
							...(failed.length > 0 ? { _accounts_failed: failed } : {}),
						}));
					} else if (operation === 'get') {
						const bundleId = this.getNodeParameter('bundleId', i) as string;
						const accountId = Number(this.getNodeParameter('bundleAccountIdRequired', i));
						const response = await gapliApiRequest.call(
							this,
							'GET',
							`/marketplace/bundles/${encodeURIComponent(bundleId)}`,
							{},
							{ account_id: accountId },
						);
						responseData = [(response.bundle as IDataObject) || {}];
					} else if (operation === 'create' || operation === 'update') {
						const accountId = Number(this.getNodeParameter('bundleAccountIdRequired', i));
						const slotsRaw = this.getNodeParameter('bundleSlots', i) as string | IDataObject[];
						const discountRaw = this.getNodeParameter('bundleDiscount', i, 'null') as
							| string
							| IDataObject
							| null;

						const parseJson = (value: unknown, field: string): IDataObject[] | IDataObject | null => {
							if (typeof value !== 'string') return (value ?? null) as IDataObject[] | IDataObject | null;
							try {
								return JSON.parse(value) as IDataObject[] | IDataObject | null;
							} catch {
								throw new NodeOperationError(
									this.getNode(),
									`Field "${field}" is not valid JSON.`,
									{ itemIndex: i },
								);
							}
						};

						// `discount` jedzie ZAWSZE, także jako null: dla Allegro null to
						// polecenie „zdejmij rabat", a pominięcie klucza znaczy co innego.
						const body: IDataObject = {
							account_id: accountId,
							slots: parseJson(slotsRaw, 'Slots (JSON)'),
							discount: parseJson(discountRaw, 'Discount (JSON)'),
						};

						const response =
							operation === 'create'
								? await gapliApiRequest.call(this, 'POST', '/marketplace/bundles', body)
								: await gapliApiRequest.call(
										this,
										'PUT',
										`/marketplace/bundles/${encodeURIComponent(
											this.getNodeParameter('bundleId', i) as string,
										)}`,
										body,
									);
						responseData = [(response.bundle as IDataObject) || {}];
					} else if (operation === 'delete') {
						const bundleId = this.getNodeParameter('bundleId', i) as string;
						const accountId = Number(this.getNodeParameter('bundleAccountIdRequired', i));
						const response = await gapliApiRequest.call(
							this,
							'DELETE',
							`/marketplace/bundles/${encodeURIComponent(bundleId)}`,
							{},
							{ account_id: accountId },
						);
						responseData = [(response.bundle as IDataObject) || {}];
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
							itemIndex: i,
						});
					}
				}

				// ─── Store ───────────────────────────────────────────────
				else if (resource === 'store') {
					const response = await gapliApiRequest.call(this, 'GET', '/stores');
					responseData = (response.stores as IDataObject[]) || [];
				}

				// ─── Industry ────────────────────────────────────────────
				else if (resource === 'industry') {
					const response = await gapliApiRequest.call(this, 'GET', '/industries');
					responseData = (response.industries as IDataObject[]) || [];
				}

				// ─── Analytics ───────────────────────────────────────────
				else if (resource === 'analytics') {
					if (operation === 'getTopProducts') {
						const period = this.getNodeParameter('period', i) as number;
						const limit = this.getNodeParameter('limit', i) as number;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/top-products',
							{},
							{ period, limit },
						);
						responseData = (response.products as IDataObject[]) || [];
					} else if (operation === 'getSalesSummary') {
						const period = this.getNodeParameter('period', i) as number;
						const accountId = Number(this.getNodeParameter('accountId', i, 0));
						const storeId = this.getNodeParameter('storeId', i, 0) as number;
						const qs: IDataObject = { period };
						if (accountId > 0) qs.account_id = accountId;
						if (storeId > 0) qs.store_id = storeId;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/sales-summary',
							{},
							qs,
						);
						responseData = (response.summary as IDataObject) || response;
					} else if (operation === 'getStockAlerts') {
						const threshold = this.getNodeParameter('threshold', i) as number;
						const marketId = this.getNodeParameter('marketId', i, 0) as number;
						const qs: IDataObject = { threshold };
						if (marketId > 0) qs.market_id = marketId;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/stock-alerts',
							{},
							qs,
						);
						responseData = (response.alerts as IDataObject[]) || [];
					} else if (operation === 'getMarketplaceHealth') {
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/marketplace-health',
						);
						responseData = (response.accounts as IDataObject[]) || [];
					} else if (operation === 'getGlobalTopProducts') {
						const period = this.getNodeParameter('period', i) as number;
						const limit = this.getNodeParameter('limit', i) as number;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/global-top-products',
							{},
							{ period, limit },
						);
						responseData = (response.products as IDataObject[]) || [];
					} else if (operation === 'getGlobalCategoryTrends') {
						const period = this.getNodeParameter('period', i) as number;
						const limit = this.getNodeParameter('limit', i) as number;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/global-category-trends',
							{},
							{ period, limit },
						);
						responseData = (response.trends as IDataObject[]) || [];
					} else if (operation === 'getPlatformStats') {
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/platform-stats',
						);
						responseData = (response.stats as IDataObject) || response;
					} else if (operation === 'getGlobalPriceBenchmarks') {
						const limit = this.getNodeParameter('limit', i) as number;
						const marketId = this.getNodeParameter('marketId', i, 0) as number;
						const qs: IDataObject = { limit };
						if (marketId > 0) qs.market_id = marketId;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/global-price-benchmarks',
							{},
							qs,
						);
						responseData = (response.benchmarks as IDataObject[]) || [];
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i },
						);
					}
				}

				// ─── Market ─────────────────────────────────────────────
				else if (resource === 'market') {
					const response = await gapliApiRequest.call(this, 'GET', '/markets');
					responseData = (response.markets as IDataObject[]) || [];
				}

				// ─── Health ──────────────────────────────────────────────
				else if (resource === 'health') {
					responseData = await gapliApiRequest.call(this, 'GET', '/health');
				}

				// ─── Duplicate Check ─────────────────────────────────────
				else if (resource === 'duplicateCheck') {
					const checkSku = this.getNodeParameter('checkSku', i, '') as string;
					const checkEan = this.getNodeParameter('checkEan', i, '') as string;
					const checkName = this.getNodeParameter('checkName', i, '') as string;
					const checkAccountId = Number(this.getNodeParameter('checkAccountId', i, 0));

					if (!checkSku.trim() && !checkEan.trim() && !checkName.trim()) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one identifier (SKU, EAN, or Name) is required for duplicate check.',
							{ itemIndex: i },
						);
					}

					const body: IDataObject = {};
					if (checkSku.trim()) body.sku = checkSku.trim();
					if (checkEan.trim()) body.ean = checkEan.trim();
					if (checkName.trim()) body.name = checkName.trim();
					if (checkAccountId > 0) body.account_id = checkAccountId;

					const response = await gapliApiRequest.call(
						this,
						'POST',
						'/marketplace/duplicate-check',
						body,
					);
					responseData = response;
				}

				// ─── Offer Health ─────────────────────────────────────────
				else if (resource === 'offerHealth') {
					const skusRaw = this.getNodeParameter('healthSkus', i) as string;
					const healthAccountId = Number(this.getNodeParameter('healthAccountId', i, 0));

					if (!skusRaw.trim()) {
						throw new NodeOperationError(
							this.getNode(),
							'SKUs field is required for offer health analysis.',
							{ itemIndex: i },
						);
					}

					const skus = skusRaw
						.split(',')
						.map((s: string) => s.trim())
						.filter(Boolean);

					if (skus.length === 0) {
						throw new NodeOperationError(
							this.getNode(),
							'At least one valid SKU is required.',
							{ itemIndex: i },
						);
					}

					if (skus.length > 200) {
						throw new NodeOperationError(
							this.getNode(),
							`Maximum 200 SKUs per request (received ${skus.length}).`,
							{ itemIndex: i },
						);
					}

					const body: IDataObject = { skus };
					if (healthAccountId > 0) body.account_id = healthAccountId;

					const response = await gapliApiRequest.call(
						this,
						'POST',
						'/marketplace/offer-health',
						body,
					);

					// Return individual offer results for easy n8n item processing
					const offers = (response.offers as IDataObject[]) || [];
					if (offers.length > 0) {
						responseData = offers;
					} else {
						responseData = {
							match_status: 'NO_OFFERS_FOUND',
							summary: response.summary || {},
							message: 'No offers found for the provided SKUs.',
						};
					}
				}

				// ─── Allegro Catalog ─────────────────────────────────────
				else if (resource === 'allegroCatalog') {
					const catalogAccountId = Number(this.getNodeParameter('catalogAccountId', i));

					if (operation === 'lookupByEan') {
						const ean = this.getNodeParameter('catalogEan', i) as string;
						if (!ean?.trim()) {
							throw new NodeOperationError(this.getNode(), 'EAN is required', { itemIndex: i });
						}
						const response = await gapliApiRequest.call(
							this, 'GET', '/allegro/catalog', {},
							{ account_id: catalogAccountId, mode: 'ean', q: ean.trim() },
						);
						responseData = response;
					}

					else if (operation === 'searchByPhrase') {
						const phrase = this.getNodeParameter('catalogPhrase', i) as string;
						const limit = this.getNodeParameter('catalogLimit', i, 10) as number;
						if (!phrase?.trim()) {
							throw new NodeOperationError(this.getNode(), 'Search phrase is required', { itemIndex: i });
						}
						const response = await gapliApiRequest.call(
							this, 'GET', '/allegro/catalog', {},
							{ account_id: catalogAccountId, mode: 'phrase', q: phrase.trim(), limit },
						);
						responseData = response;
					}

					else if (operation === 'getCategoryParameters') {
						const categoryId = this.getNodeParameter('catalogCategoryId', i) as string;
						if (!categoryId?.trim()) {
							throw new NodeOperationError(this.getNode(), 'Category ID is required', { itemIndex: i });
						}
						const response = await gapliApiRequest.call(
							this, 'GET', '/allegro/category-parameters', {},
							{ account_id: catalogAccountId, category_id: categoryId.trim() },
						);
						responseData = response;
					}

					else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
					}
				}

				// ─── Allegro Listing ─────────────────────────────────────
				else if (resource === 'allegroListing') {
					const listingAccountId = Number(this.getNodeParameter('listingAccountId', i));

					if (operation === 'sendProducts' || operation === 'checkReadiness') {
						const skusRaw = this.getNodeParameter('listingSkus', i) as string;
						if (!skusRaw?.trim()) {
							throw new NodeOperationError(this.getNode(), 'Product SKUs are required', { itemIndex: i });
						}
						const productSkus = skusRaw.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
						if (productSkus.length === 0) {
							throw new NodeOperationError(this.getNode(), 'At least one valid SKU is required', { itemIndex: i });
						}
						if (productSkus.length > 10000) {
							throw new NodeOperationError(this.getNode(), `Maximum 10,000 SKUs per request (received ${productSkus.length})`, { itemIndex: i });
						}

						const isDryRun = operation === 'checkReadiness' || (this.getNodeParameter('listingDryRun', i, false) as boolean);
						const shippingRateId = this.getNodeParameter('listingShippingRateId', i, '') as string;
						const priceMin = this.getNodeParameter('listingPriceMin', i, 50) as number;
						const priceMax = this.getNodeParameter('listingPriceMax', i, 50000) as number;

						const body: IDataObject = {
							action: isDryRun ? 'check-readiness' : 'send',
							account_id: listingAccountId,
							product_skus: productSkus,
							dry_run: isDryRun,
							price_range: { min: priceMin, max: priceMax },
						};
						if (shippingRateId.trim()) body.shipping_rate_id = shippingRateId.trim();

						const response = await gapliApiRequest.call(this, 'POST', '/marketplace/listing', body);
						responseData = response;
					}

					else if (operation === 'getStatus') {
						const statusSkus = this.getNodeParameter('statusSkus', i, '') as string;
						const statusLimit = this.getNodeParameter('statusLimit', i, 100) as number;

						const body: IDataObject = {
							action: 'get-status',
							account_id: listingAccountId,
						};
						if (statusSkus.trim()) {
							body.product_skus = statusSkus.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
						}
						body.limit = statusLimit;

						const response = await gapliApiRequest.call(this, 'POST', '/marketplace/listing', body);

						// Return individual products for easy n8n item processing
						const products = (response.products as IDataObject[]) || [];
						if (products.length > 0) {
							responseData = products;
						} else {
							responseData = {
								summary: response.summary || {},
								total: response.total || 0,
								message: 'No products found for this account.',
							};
						}
					}

					else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
					}
				}

				// ─── Unknown ─────────────────────────────────────────────
				else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource: ${resource}`,
						{ itemIndex: i },
					);
				}

				// Normalize output
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
