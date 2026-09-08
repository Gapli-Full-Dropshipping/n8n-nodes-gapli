import type { INodeProperties } from 'n8n-workflow';

export const storeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['store'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many your connected stores',
				action: 'Get many stores',
			},
		],
		default: 'getAll',
	},
];

export const storeFields: INodeProperties[] = [];
