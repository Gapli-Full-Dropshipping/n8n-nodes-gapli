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
				displayName: 'Exclude Already Listed on Accounts',
				name: 'exclude_already_listed_on_accounts',
				type: 'string',
				default: '',
				placeholder: 'e.g. 50,53,55',
				description: 'Comma-separated Allegro account IDs — products already listed on these accounts will be excluded from results',
			},
			{
				displayName: 'Exclude Oversized',
				name: 'exclude_oversized',
				type: 'boolean',
				default: false,
				description: 'Whether to exclude oversized products (products flagged as is_oversized)',
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
				displayName: 'Parser ID',
				name: 'parser_id',
				type: 'number',
				default: 0,
				description: 'Filter by wholesaler/parser ID',
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
		],
	},
];
