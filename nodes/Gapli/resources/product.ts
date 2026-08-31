import type { INodeProperties } from 'n8n-workflow';

export const productOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
		options: [
			{
				name: 'Assess Sellability',
				value: 'assessSellability',
				description: 'Check if products are ready for Allegro listing — returns sellability score (0-100), validation status, and block reason codes',
				action: 'Assess product sellability',
			},
			{
				name: 'Batch EAN Lookup',
				value: 'batchEan',
				description: 'Look up multiple products by EAN/GTIN barcodes in a single request (up to 100)',
				action: 'Batch EAN lookup',
			},
			{
				name: 'Batch SKU Lookup',
				value: 'batchSku',
				description: 'Look up multiple products by SKU identifiers in a single request (up to 100)',
				action: 'Batch SKU lookup',
			},
			{
				name: 'Get Already Listed Evidence',
				value: 'getAlreadyListedEvidence',
				description: 'Check which SKUs are already listed on specific Allegro accounts — returns per-SKU auditable evidence',
				action: 'Get already listed evidence',
			},
			{
				name: 'Get by SKU',
				value: 'get',
				description: 'Retrieve a single product by its SKU',
				action: 'Get a product by SKU',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of products from your catalog',
				action: 'Get many products',
			},
			{
				name: 'Lookup By EAN',
				value: 'lookupByEan',
				description: 'Find a single product by its exact EAN/GTIN barcode',
				action: 'Lookup product by EAN',
			},
		],
		default: 'getAll',
	},
];

export const productFields: INodeProperties[] = [
	// ── Get by SKU ──
	{
		displayName: 'SKU',
		name: 'sku',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['get'],
			},
		},
		description: 'The SKU (Stock Keeping Unit) of the product to retrieve',
		placeholder: 'e.g. PROD-001-XL',
	},

	// ── Lookup By EAN ──
	{
		displayName: 'EAN/GTIN Code',
		name: 'eanCode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['lookupByEan'],
			},
		},
		description: 'The exact EAN/GTIN barcode of the product to find',
		placeholder: 'e.g. 5901234123457',
	},
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
				resource: ['product'],
				operation: ['lookupByEan'],
			},
		},
		description: 'Scope lookup to a specific market/region. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ── Get Already Listed Evidence ──
	{
		displayName: 'SKU Codes',
		name: 'evidenceSkus',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAlreadyListedEvidence'],
			},
		},
		description: 'SKU identifiers to check, one per line (max 500). You can also use a comma-separated list.',
		placeholder: 'SKU-001-XL_350\nSKU-002-M_350\nSKU-003-S_350',
	},
	{
		displayName: 'Allegro Account IDs',
		name: 'evidenceAccountIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAlreadyListedEvidence'],
			},
		},
		description: 'Comma-separated Allegro account IDs to check against (e.g. 50,53,55). Use Marketplace → Get Accounts to find your account IDs.',
		placeholder: 'e.g. 50,53,55',
	},

	// ── Batch EAN Lookup — Fields ──
	{
		displayName: 'EAN Codes',
		name: 'eanCodes',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['batchEan'],
			},
		},
		description: 'EAN/GTIN barcodes to look up, one per line (max 100). You can also use a comma-separated list.',
		placeholder: '5901234123457\n5901234123464\n5901234123471',
	},
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
				resource: ['product'],
				operation: ['batchEan'],
			},
		},
		description: 'Scope lookup to a specific market/region. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ── Batch SKU Lookup — Fields ──
	{
		displayName: 'SKU Codes',
		name: 'skuCodes',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['batchSku'],
			},
		},
		description: 'SKU identifiers to look up, one per line (max 100). You can also use a comma-separated list.',
		placeholder: 'SKU-001-XL\nSKU-002-M\nSKU-003-S',
	},
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
				resource: ['product'],
				operation: ['batchSku'],
			},
		},
		description: 'Scope lookup to a specific market/region. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ── Get Many — Market Selector ──
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
				resource: ['product'],
				operation: ['getAll'],
			},
		},
		description: 'Scope results to a specific market/region. Only products from wholesalers assigned to this market will be returned. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ── Get Many — Filters ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Full Database Scan',
		name: 'scanAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAll'],
				returnAll: [true],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-description-boolean-without-whether
		description:
			'Scan all parser partitions to fetch every matching product in a single request. Use for Allegro offer selection workflows that need the complete catalog. Without this, results are limited to standard pagination. The response includes _meta with total_before_filters, total_after_filters, and truncated flag.',
		hint: 'Only available when Return All is enabled. When active, the node iterates all wholesaler partitions. Use Max Items to control the safety cap.',
	},
	{
		displayName: 'Max Items',
		name: 'maxItems',
		type: 'number',
		typeOptions: {
			minValue: 100,
			maxValue: 50000,
		},
		default: 5000,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAll'],
				returnAll: [true],
				scanAll: [true],
			},
		},
		description: 'Safety limit — maximum number of products to return from the full database scan. Backend hard cap is 50,000.',
		hint: 'Set a lower value to prevent n8n memory issues during testing. Increase gradually as needed.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Offset',
		name: 'offset',
		type: 'number',
		typeOptions: {
			minValue: 0,
		},
		default: 0,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		description: 'Number of results to skip before returning items — combine with Limit for manual pagination (offset = page_number × limit)',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Adult Products',
				name: 'adult',
				type: 'options',
				options: [
					{
						name: 'Include (Default)',
						value: 'include',
						description: 'No filtering — adult products appear alongside everything else',
					},
					{
						name: 'Exclude',
						value: 'exclude',
						description: 'Skip adult/erotic products entirely',
					},
					{
						name: 'Only',
						value: 'only',
						description: 'Return adult/erotic products exclusively',
					},
				],
				default: 'include',
				description: 'Whether adult/erotic products take part in the result. Set to Exclude when sourcing by name — a search for "toys" otherwise pulls in erotic toys with matching names. Combines two signals: the wholesaler feed flag and the wholesaler being in the erotic industry, so it also covers wholesalers whose feed never sets the flag. Every product carries is_adult in the response.',
			},
			{
				displayName: 'Available Only',
				name: 'available',
				type: 'boolean',
				default: false,
				description: 'Whether to return only products that are currently in stock',
			},
			{
				displayName: 'EAN/GTIN',
				name: 'ean',
				type: 'string',
				default: '',
				placeholder: 'e.g. 5901234123457',
				description: 'Exact match by EAN/GTIN barcode — returns only products with this exact barcode',
			},
			{
				displayName: 'Exclude Already Listed on Accounts',
				name: 'exclude_already_listed_on_accounts',
				type: 'string',
				default: '',
				placeholder: 'e.g. 50,53,55',
				description: 'Comma-separated Allegro account IDs — products already listed on these accounts will be excluded from results. The response includes _exclude_meta with excluded_skus_count for verification.',
			},
			{
				displayName: 'Exclude Oversized',
				name: 'exclude_oversized',
				type: 'boolean',
				default: false,
				description: 'Whether to exclude oversized products (products flagged as is_oversized)',
			},
			{
				displayName: 'Exclude Parser IDs',
				name: 'exclude_parser_ids',
				type: 'string',
				default: '',
				placeholder: 'e.g. 5,12,29',
				description: 'Comma-separated parser IDs to exclude from results — useful for skipping wholesalers with digital/service products. To restrict results to a SINGLE wholesaler/parser, use the "Wholesaler / Parser ID" filter instead.',
			},
			{
				displayName: 'Has EAN/GTIN',
				name: 'has_ean',
				type: 'boolean',
				default: false,
				description: 'Whether to return only products that have a valid EAN/GTIN barcode',
			},
			{
				displayName: 'Max Gross Price (PLN)',
				name: 'price_gross_max',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0,
				description: 'Only return products with gross price ≤ this value (in PLN)',
			},
			{
				displayName: 'Min Gross Price (PLN)',
				name: 'price_gross_min',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0,
				description: 'Only return products with gross price ≥ this value (in PLN)',
			},
			{
				displayName: 'Minimum Stock',
				name: 'stock_min',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 1,
				description: 'Only return products with stock quantity ≥ this value (e.g. 5 to skip low-stock items)',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Free-text search across product name, description, and SKU',
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				description: 'Filter by SKU (partial match)',
			},
			{
				displayName: 'Wholesaler / Parser ID Name or ID',
				name: 'parser_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getWholesalers',
				},
				default: 0,
				description: 'INCLUDE filter — return only products from this single wholesaler catalog (API param: parser_id, e.g. 33 = Action). SKUs in the result carry the _&lt;parser_id&gt; suffix. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
	// ── Assess Sellability ──
	{
		displayName: 'SKUs',
		name: 'sellabilitySkus',
		type: 'string',
		typeOptions: {
			rows: 8,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['assessSellability'],
			},
		},
		default: '',
		description: 'Comma-separated or newline-separated list of SKUs to assess (max 100). Each SKU must contain the parser suffix (e.g. "PROD001_350").',
	},
	{
		displayName: 'Allegro Account Name or ID',
		name: 'sellabilityAccountId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllegroAccounts',
		},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['assessSellability'],
			},
		},
		default: 0,
		description: 'Optional: check listing context on a specific Allegro account. Shows whether the product is already listed and its current status. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];
