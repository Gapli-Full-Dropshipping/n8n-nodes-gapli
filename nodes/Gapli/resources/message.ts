import type { INodeProperties } from 'n8n-workflow';

export const messageOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		options: [
			{
				name: 'Get Many Threads',
				value: 'getAllThreads',
				description: 'Retrieve conversation threads, disputes and claims',
				action: 'Get many conversation threads',
			},
			{
				name: 'Get Thread',
				value: 'getThread',
				description: 'Retrieve a single thread with its messages',
				action: 'Get a conversation thread',
			},
		],
		default: 'getAllThreads',
	},
];

export const messageFields: INodeProperties[] = [
	// ── Get Thread ──
	{
		displayName: 'Thread ID',
		name: 'threadId',
		type: 'number',
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['getThread'],
			},
		},
		description: 'The numeric ID of the conversation thread',
	},

	// ── Get Many Threads ──
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['getAllThreads'],
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
			maxValue: 100,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['getAllThreads'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
	},

	// ── Wspólne dla obu operacji ──
	{
		displayName: 'Include Automated Messages',
		name: 'includeAutomated',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['message'],
			},
		},
		description:
			'Whether to include GAPLI automated messages (invoice notifications, review requests, shipping updates). They are roughly half of all traffic, so leaving this off keeps the actual buyer conversation readable.',
	},

	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['message'],
				operation: ['getAllThreads'],
			},
		},
		// Kolejność alfabetyczna po displayName — wymuszona przez linter n8n
		options: [
			{
				displayName: 'Account ID',
				name: 'account_id',
				type: 'number',
				default: 0,
				description: 'Filter by marketplace account',
			},
			{
				displayName: 'From Date',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Return threads created on or after this date (ISO 8601)',
			},
			{
				displayName: 'Order ID',
				name: 'order_id',
				type: 'number',
				default: 0,
				description:
					'Internal GAPLI order ID. Note: disputes and claims have no internal order ID — use Source Order ID to find them.',
			},
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Allegro', value: 'allegro' },
					{ name: 'Emag', value: 'emag' },
					{ name: 'Empik', value: 'empik' },
					{ name: 'Erli', value: 'erli' },
					{ name: 'Kaufland', value: 'kaufland' },
				],
				default: '',
				description: 'Filter by marketplace platform',
			},
			{
				displayName: 'Source Order ID',
				name: 'source_order_id',
				type: 'string',
				default: '',
				description:
					'Marketplace order number. This is the ONLY link for disputes and claims — filtering by Order ID alone silently misses them.',
			},
			{
				displayName: 'Thread Type',
				name: 'thread_type',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Claim', value: 'claim' },
					{ name: 'Dispute', value: 'dispute' },
					{ name: 'Message', value: 'message' },
					{ name: 'Notification', value: 'notification' },
				],
				default: '',
				description: 'Filter by thread type',
			},
			{
				displayName: 'To Date',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Return threads created on or before this date (ISO 8601)',
			},
		],
	},
];
