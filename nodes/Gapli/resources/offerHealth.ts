import type { INodeProperties } from 'n8n-workflow';

export const offerHealthOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['offerHealth'],
			},
		},
		options: [
			{
				name: 'Analyze Offers',
				value: 'analyzeOffers',
				description:
					'Evaluate data completeness and quality of Allegro offers — returns health score (0-100) and issues per SKU',
				action: 'Analyze offer health',
			},
		],
		default: 'analyzeOffers',
	},
];

export const offerHealthFields: INodeProperties[] = [
	// ── Analyze Offers — Inputs ──
	{
		displayName: 'SKUs',
		name: 'healthSkus',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['offerHealth'],
				operation: ['analyzeOffers'],
			},
		},
		description:
			'Comma-separated list of SKUs to analyze (max 200). Example: "SKU-001,SKU-002,SKU-003".',
		placeholder: 'SKU-001,SKU-002,SKU-003',
	},
	{
		displayName: 'Allegro Account Name or ID',
		name: 'healthAccountId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllegroAccounts',
		},
		default: 0,
		displayOptions: {
			show: {
				resource: ['offerHealth'],
				operation: ['analyzeOffers'],
			},
		},
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
];
