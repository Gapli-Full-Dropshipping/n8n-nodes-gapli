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
		],
		default: 'getAccounts',
	},
];

export const marketplaceFields: INodeProperties[] = [
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
				displayName: 'Account ID',
				name: 'account_id',
				type: 'number',
				default: 0,
				description: 'Filter by marketplace account ID',
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
