import type { INodeProperties } from 'n8n-workflow';

export const marketOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['market'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve the list of available markets/regions with country flags',
				action: 'Get many markets',
			},
		],
		default: 'getAll',
	},
];

export const marketFields: INodeProperties[] = [];
