import type { INodeProperties } from 'n8n-workflow';

/**
 * ⚠️ WARSTWA, NIE PROXY. Ten zasób NIE łączy się z Shopify ani z WooCommerce.
 * Node rozmawia wyłącznie z API GAPLI, a GAPLI robi swoje po stronie sklepu —
 * przez Admin API Shopify albo przez wtyczkę WooCommerce. Operator mówi
 * „zatowaruj mój sklep tymi SKU" i NIE musi mieć żadnego dostępu do API
 * własnego sklepu.
 *
 * Opisy poniżej to jedyna dokumentacja, którą ktoś realnie przeczyta — nie mogą
 * więc sugerować, że gdziekolwiek potrzebne są poświadczenia sklepu.
 */

export const storeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['store'],
			},
		},
		options: [
			{
				name: 'Get Assortment',
				value: 'getAssortment',
				description:
					'What actually stands in one store, SKU by SKU. Read _meta.source before concluding that a product is missing: it says whether you are holding our dispatch register or a sweep that is days old.',
				action: 'Get the assortment of a store',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many your connected stores',
				action: 'Get many stores',
			},
			{
				name: 'Get Statistics',
				value: 'getStatistics',
				description:
					"The store's OWN sales for a period — orders by status, revenue from paid orders, average order value and assortment size. Marketplace sales are NOT included.",
				action: 'Get statistics for a store',
			},
			{
				name: 'Send Products',
				value: 'sendProducts',
				description:
					'Stock the store from the GAPLI catalogue. GAPLI creates the cards over its own channel, so no store API access of yours is involved. Capped at 100 SKUs, and the request BLOCKS until the store has taken them — minutes, not seconds.',
				action: 'Send products to a store',
			},
		],
		default: 'getAll',
	},
];

export const storeFields: INodeProperties[] = [
	// ── Store (wspólne dla trzech operacji asortymentowych) ──
	{
		displayName: 'Store Name or ID',
		name: 'targetStoreId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStores',
		},
		required: true,
		default: 0,
		description:
			'The store to act on. Only stores with a real sales engine (Shopify, WooCommerce, PrestaShop, Magento) carry an assortment — a "virtual" store is a bridge to a marketplace account and is refused with HTTP 409. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['sendProducts', 'getAssortment', 'getStatistics'],
			},
		},
	},

	// ── Send Products ───────────────────────────────────────────────
	{
		displayName:
			'GAPLI stocks the store itself — over the Shopify Admin API or the WooCommerce plugin. You need no access to your own store\'s API, and this node never talks to Shopify or WooCommerce.',
		name: 'sendProductsChannelNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['sendProducts'],
			},
		},
	},
	{
		displayName:
			'This request WAITS for the store. Shopify takes one product per points-metered mutation (~30 cards/min per store), so 100 SKUs run for several minutes; the node allows 10 minutes for it. Never retry on a timeout — the send is most likely still in flight, and a second call double-stocks the store. Check with Get Assortment instead.',
		name: 'sendProductsDurationNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['sendProducts'],
			},
		},
	},
	{
		displayName:
			'Read trimmed_by_limit and warnings[] in the reply. The store\'s product limit applies here exactly as it does in the panel: over the limit the batch is TRIMMED, and only trimmed_by_limit tells you by how much — sent_count alone looks like a full success. On WooCommerce sent_count means HOW MANY WERE SENT, not how many the store accepted, because the plugin takes the batch asynchronously.',
		name: 'sendProductsLimitNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['sendProducts'],
			},
		},
	},
	{
		displayName: 'Product SKUs',
		name: 'storeSkus',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		required: true,
		default: '',
		placeholder: '13470_136\n13471_136',
		description:
			'SKUs from the GAPLI catalogue to place in the store. One per line or comma-separated. Max 100 per request — the ceiling is the store\'s throughput, not a database limit, so send the rest as a second batch rather than raising it.',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['sendProducts'],
			},
		},
	},
	{
		displayName: 'Pricing',
		name: 'storePricing',
		type: 'collection',
		placeholder: 'Add Pricing Option',
		default: {},
		description:
			'How the store price is derived from the catalogue price. Applied in this order: percentage markup, then flat markup, then the profit reduction — which cuts only what the two markups added, never the catalogue margin. Leave empty to send the catalogue price unchanged.',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['sendProducts'],
			},
		},
		options: [
			{
				displayName: 'Markup Increase (%)',
				name: 'markup_increase_percent',
				type: 'number',
				default: 0,
				description: 'Percentage markup added to the catalogue sale price',
			},
			{
				displayName: 'Markup Increase (Value)',
				name: 'markup_increase_value',
				type: 'number',
				default: 0,
				description: 'Flat amount added after the percentage markup',
			},
			{
				displayName: 'Profit Reduction (%)',
				name: 'profit_reduction_percent',
				type: 'number',
				default: 0,
				description:
					'Cuts the PROFIT — the difference the markups added — not the price. It can never take the price below the catalogue price.',
			},
		],
	},
	{
		displayName: 'Store Category IDs',
		name: 'storeCategoryIds',
		type: 'string',
		default: '',
		placeholder: '12,34',
		description:
			'Categories in your own store to file the products under, comma-separated (WooCommerce). Leave empty for the default. The category mode (merge/replace) is deliberately not exposed here — through the API it would be a parameter that quietly rewires categories across the whole store.',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['sendProducts'],
			},
		},
	},

	// ── Get Assortment ──────────────────────────────────────────────
	{
		displayName:
			'Check _meta.source on every item before deciding that something is not in the store. shopify_product_map is GAPLI\'s own dispatch register — accurate to the minute. store_snapshot is a sweep filled in round-robin that reaches some stores only once every few days: look at _meta.snapshot_updated_at first, or you will read a stale sweep as a missing product. never_synced: true means the card IS in the store but has never received a stock sync.',
		name: 'getAssortmentSourceNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['getAssortment'],
			},
		},
	},
	{
		displayName:
			'One page holds at most 500 items and a stocked store routinely holds more, so turn Return All on for a complete picture — otherwise a large store is cut at the first page. When the store holds nothing at all, the node still returns one item carrying store, total and _meta, so a stale sweep never arrives as silence.',
		name: 'getAssortmentPagingNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['getAssortment'],
			},
		},
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['getAssortment'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['getAssortment'],
				returnAll: [false],
			},
		},
	},

	// ── Get Statistics ──────────────────────────────────────────────
	{
		displayName:
			'These are the store\'s OWN sales, never marketplace sales. Allegro and Erli orders also carry a store_id (the store their marketplace account is pinned to), so a counter built on store_id alone returns a figure several times too high and entirely believable. Average order value is computed from PAID orders only, so a cart abandoned in status "new" does not drag it down.',
		name: 'getStatisticsScopeNotice',
		type: 'notice',
		default: '',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['getStatistics'],
			},
		},
	},
	{
		displayName: 'Period (Days)',
		name: 'storePeriodDays',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 365,
		},
		default: 30,
		description: 'How many days back to count orders and revenue over',
		displayOptions: {
			show: {
				resource: ['store'],
				operation: ['getStatistics'],
			},
		},
	},
];
