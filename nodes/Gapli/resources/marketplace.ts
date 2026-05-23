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
		],
	},
];
