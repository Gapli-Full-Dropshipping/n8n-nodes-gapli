import type { INodeProperties } from 'n8n-workflow';

export const industryOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['industry'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve many available industries/categories',
				action: 'Get many industries',
			},
		],
		default: 'getAll',
	},
];

export const industryFields: INodeProperties[] = [];
