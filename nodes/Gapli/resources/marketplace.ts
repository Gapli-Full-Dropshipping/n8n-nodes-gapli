import type { INodeProperties } from 'n8n-workflow';

export const marketplaceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['marketplace'],
			},
		},
		options: [
			{
				name: 'Get Accounts',
				value: 'getAccounts',
				description: 'Retrieve the list of connected marketplace accounts (Allegro, Erli)',
				action: 'Get marketplace accounts',
			},
			{
				name: 'Get Products',
				value: 'getProducts',
				description: 'Retrieve products listed on marketplace accounts',
				action: 'Get marketplace products',
			},
			{
				name: 'Get Wholesaler Coverage',
				value: 'getWholesalerCoverage',
				description:
					'Ready-made per-wholesaler counts for Allegro accounts — how many products from each wholesaler sit on each account, without paging through every offer',
				action: 'Get wholesaler coverage',
			},
			{
				name: 'Search Offers by EAN',
				value: 'searchOffersByEan',
				description: 'Find Allegro offers matching an exact EAN/GTIN barcode across all your accounts',
				action: 'Search offers by EAN',
			},
			{
				name: 'Search Offers by Name',
				value: 'searchOffersByName',
				description: 'Find Allegro offers matching a product name (partial match) across all your accounts',
				action: 'Search offers by name',
			},
			{
				name: 'Search Offers by SKU',
				value: 'searchOffersBySku',
				description: 'Find Allegro offers matching an exact SKU across all your accounts',
				action: 'Search offers by SKU',
			},
		],
		default: 'getAccounts',
	},
];

export const marketplaceFields: INodeProperties[] = [
	// ── Get Accounts — Market Selector ──
	{
		displayName: 'Market Name or ID',
		name: 'marketId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getMarkets',
		},
		default: 0,
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['getAccounts'],
			},
		},
		description: 'Scope results to a specific market/region. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ── Search Offers by SKU ──
	{
		displayName: 'SKU',
		name: 'offerSearchQuery',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['searchOffersBySku'],
			},
		},
		description: 'Exact SKU to search for across all Allegro accounts',
		placeholder: 'e.g. PROD-001-XL_350',
	},

	// ── Search Offers by EAN ──
	{
		displayName: 'EAN/GTIN Code',
		name: 'offerSearchQuery',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['searchOffersByEan'],
			},
		},
		description: 'Exact EAN/GTIN barcode to search for across all Allegro accounts',
		placeholder: 'e.g. 5901234123457',
	},

	// ── Search Offers by Name ──
	{
		displayName: 'Product Name',
		name: 'offerSearchQuery',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['searchOffersByName'],
			},
		},
		description: 'Product name to search for (partial match, case-insensitive) across all Allegro accounts',
		placeholder: 'e.g. Bluetooth Speaker',
	},

	// ── Search Offers — Common Optional Fields ──
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 500,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['searchOffersBySku', 'searchOffersByEan', 'searchOffersByName'],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Allegro Account Name or ID',
		name: 'offerAccountId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllegroAccounts',
		},
		default: 0,
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['searchOffersBySku', 'searchOffersByEan', 'searchOffersByName'],
			},
		},
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// ── Get Wholesaler Coverage ──
	{
		displayName: 'Allegro Account Name or ID',
		name: 'coverageAccountId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllegroAccounts',
		},
		default: 0,
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['getWholesalerCoverage'],
			},
		},
		description:
			'Leave empty to cover every Allegro account you own in a single request. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Output',
		name: 'coverageOutput',
		type: 'options',
		options: [
			{
				name: 'One Item per Account and Wholesaler',
				value: 'flat',
				description: 'Spreadsheet-friendly rows: account × wholesaler with counts',
			},
			{
				name: 'One Item per Account',
				value: 'byAccount',
				description: 'Each account with its nested wholesaler breakdown and totals',
			},
			{
				name: 'One Item per Wholesaler',
				value: 'byWholesaler',
				description: 'Each wholesaler with how many accounts it sits on and which ones',
			},
		],
		default: 'flat',
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['getWholesalerCoverage'],
			},
		},
		description: 'How to shape the result into n8n items',
	},

	// ── Get Products — Filters ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['getProducts'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
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
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['getProducts'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['marketplace'],
				operation: ['getProducts'],
			},
		},
		options: [
			{
				displayName: 'Allegro Account Name or ID',
				name: 'account_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAllegroAccounts',
				},
				default: 0,
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Category ID',
				name: 'category_id',
				type: 'string',
				default: '',
				description:
					'Allegro category ID, or several separated by commas. This is what tells you whether two offers sit on the same shelf — a rank built without it happily pairs a cosmetics bag with a felt organiser.',
			},
			{
				displayName: 'Max Price (Gross)',
				name: 'price_max',
				type: 'number',
				default: 0,
				description: 'Only offers priced at or below this gross amount',
			},
			{
				displayName: 'Min Price (Gross)',
				name: 'price_min',
				type: 'number',
				default: 0,
				description: 'Only offers priced at or above this gross amount',
			},
			{
				displayName: 'Min Stock',
				name: 'stock_min',
				type: 'number',
				default: 0,
				description: 'Only offers with at least this much stock. Use 2 when both halves of a bundle must stay sellable.',
			},
			{
				displayName: 'Parser ID',
				name: 'parser_id',
				type: 'string',
				default: '',
				description:
					'Wholesaler parser ID — the same number that is the SKU suffix (50205095_73 → 73). Several allowed, comma-separated. Use this to keep a bundle inside ONE wholesaler so it ships as one parcel.',
			},
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Allegro', value: 'allegro' },
					{ name: 'Erli', value: 'erli' },
				],
				default: '',
				description: 'Filter by marketplace platform',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active Only', value: 'active' },
					{ name: 'Ended Only', value: 'ended' },
					{ name: 'All Statuses', value: 'all' },
				],
				default: 'active',
				description: 'Filter by offer status (default: active only)',
			},
			{
				displayName: 'Updated Since',
				name: 'updated_since',
				type: 'dateTime',
				default: '',
				description: 'Only offers changed at or after this moment — the cheap way to run a daily incremental scan',
			},
			{
				displayName: 'Wholesaler ID',
				name: 'wholesaler_id',
				type: 'string',
				default: '',
				description:
					'Wholesaler ID from the GAPLI registry (as returned by Get Wholesaler Coverage). NOT the same numbering as Parser ID — the API resolves one into the other.',
			},
		],
	},
];
