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
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of products from your catalog',
				action: 'Get many products',
			},
			{
				name: 'Get by SKU',
				value: 'get',
				description: 'Retrieve a single product by its SKU',
				action: 'Get a product by SKU',
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
		hint: 'Only available when Return All is enabled. When active, the node iterates all wholesaler partitions. The Limit setting is ignored in this mode.',
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
				description: 'Comma-separated parser IDs to exclude from results — useful for skipping wholesalers with digital/service products',
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
				displayName: 'Wholesaler Name or ID',
				name: 'parser_id',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getWholesalers',
				},
				default: 0,
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
		],
	},
];

