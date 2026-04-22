import type { INodeProperties } from 'n8n-workflow';

export const orderOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['order'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of orders',
				action: 'Get many orders',
			},
			{
				name: 'Get by ID',
				value: 'get',
				description: 'Retrieve a single order by its ID',
				action: 'Get an order by ID',
			},
		],
		default: 'getAll',
	},
];

export const orderFields: INodeProperties[] = [
	// ── Get by ID ──
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['get'],
			},
		},
		description: 'The numeric ID of the order to retrieve',
	},

	// ── Get Many — Filters ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['order'],
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
				resource: ['order'],
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
				resource: ['order'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'New', value: 'new' },
					{ name: 'Processing', value: 'processing' },
					{ name: 'Shipped', value: 'shipped' },
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Returned', value: 'returned' },
				],
				default: '',
				description: 'Filter by order status',
			},
			{
				displayName: 'From Date',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Return orders created on or after this date (ISO 8601)',
			},
			{
				displayName: 'To Date',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Return orders created on or before this date (ISO 8601)',
			},
		],
	},
];
