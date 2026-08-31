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
			{
				name: 'Get Conversation Analysis',
				value: 'getAnalysis',
				description:
					'Get an AI conclusion for the order: outcome, root cause, what went well and what went wrong (paid plans only)',
				action: 'Get conversation analysis for an order',
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
				operation: ['get', 'getAnalysis'],
			},
		},
		description: 'The numeric ID of the order to retrieve',
	},
	{
		displayName: 'Include',
		name: 'include',
		type: 'multiOptions',
		default: [],
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['get'],
			},
		},
		options: [
			{
				name: 'Conversation',
				value: 'conversation',
				description:
					'Buyer conversation, disputes and claims attached to this order. Requires the "messages" scope on your API key.',
			},
			{
				name: 'Diagnostics',
				value: 'diagnostics',
				description:
					'Deterministic order breakdown: wholesaler per item, status timings, issue reason codes and warning flags. No AI involved.',
			},
			{
				name: 'Financials',
				value: 'financials',
				description:
					'Actual money result: revenue, wholesale and operational costs, marketplace commission, refunds and the operator payout. Requires the "financials" scope on your API key.',
			},
			{
				name: 'Analysis',
				value: 'analysis',
				description:
					'Last computed conversation verdict (what went well, what went wrong, root cause). Served from storage, never recomputed — null when nothing has been computed yet. Use the Get Conversation Analysis operation to compute a fresh one. Paid plans only; requires the "messages" scope.',
			},
		],
		description:
			'Extra blocks to attach to the order. They ride along on this same request, so enabling them does not add HTTP calls to your workflow.',
	},
	{
		displayName: 'Include Automated Messages',
		name: 'includeAutomated',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['get'],
				include: ['conversation'],
			},
		},
		description:
			'Whether to include GAPLI automated messages (invoice notifications, review requests, shipping updates) in the conversation block',
	},
	{
		displayName: 'Force Refresh',
		name: 'refresh',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['getAnalysis'],
			},
		},
		description:
			'Whether to recompute the analysis even when the conversation has not changed. Leave off — cached results are free, recomputing costs AI tokens.',
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
					{ name: 'Cancelled', value: 'cancelled' },
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'New', value: 'new' },
					{ name: 'Processing', value: 'processing' },
					{ name: 'Returned', value: 'returned' },
					{ name: 'Shipped', value: 'shipped' },
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
	{
		displayName: 'Include Financials',
		name: 'includeFinancials',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['getAll'],
			},
		},
		description:
			'Whether to attach the actual money result to every order in the list. One request covers the whole page, so it does not multiply HTTP calls. Requires the "financials" scope on your API key.',
	},
	{
		displayName: 'Include Conversation Analysis',
		name: 'includeAnalysis',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['order'],
				operation: ['getAll'],
			},
		},
		description:
			'Whether to attach the last computed conversation verdict to every order in the list. One request covers the whole page — this is the alternative to calling Get Conversation Analysis in a loop, which burns one request per order against your rate limit. Orders with nothing computed yet return null. Paid plans only; requires the "messages" scope.',
	},
];
