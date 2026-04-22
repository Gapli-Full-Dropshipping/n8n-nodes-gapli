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
				displayName: 'Parser ID',
				name: 'parser_id',
				type: 'number',
				default: 0,
				description: 'Filter by wholesaler/parser ID',
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				description: 'Filter by SKU (partial match)',
			},
			{
				displayName: 'Search',
				name: 'search',
				type: 'string',
				default: '',
				description: 'Free-text search across product name, description, and SKU',
			},
			{
				displayName: 'Available Only',
				name: 'available',
				type: 'boolean',
				default: false,
				description: 'Whether to return only products that are currently in stock',
			},
		],
	},
];
