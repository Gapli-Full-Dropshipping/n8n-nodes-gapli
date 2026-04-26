import type { INodeProperties } from 'n8n-workflow';

export const wholesalerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['wholesaler'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve the list of available wholesalers',
				action: 'Get many wholesalers',
			},
		],
		default: 'getAll',
	},
];

export const wholesalerFields: INodeProperties[] = [
	{
		displayName: 'Active Only',
		name: 'activeOnly',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['wholesaler'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return only active wholesalers',
	},
];
