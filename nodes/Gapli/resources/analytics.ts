import type { INodeProperties } from 'n8n-workflow';

export const analyticsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['analytics'],
			},
		},
		options: [
			{
				name: 'Get Top Products',
				value: 'getTopProducts',
				description: 'Get the best-selling products for a given period',
				action: 'Get top selling products',
			},
			{
				name: 'Get Sales Summary',
				value: 'getSalesSummary',
				description: 'Get aggregated sales summary with daily breakdown',
				action: 'Get sales summary',
			},
			{
				name: 'Get Stock Alerts',
				value: 'getStockAlerts',
				description: 'Get products with critically low stock (includes days-until-stockout)',
				action: 'Get stock alerts',
			},
			{
				name: 'Get Marketplace Health',
				value: 'getMarketplaceHealth',
				description: 'Get health status of marketplace accounts (Allegro offer stats)',
				action: 'Get marketplace health',
			},
		],
		default: 'getTopProducts',
	},
];

export const analyticsFields: INodeProperties[] = [
	// ── Top Products — Fields ──
	{
		displayName: 'Period (Days)',
		name: 'period',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 365,
		},
		default: 30,
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['getTopProducts'],
			},
		},
		description: 'Number of days to analyze (e.g. 7, 30, 90)',
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
				resource: ['analytics'],
				operation: ['getTopProducts'],
			},
		},
		description: 'Max number of results to return',
	},

	// ── Sales Summary — Fields ──
	{
		displayName: 'Period (Days)',
		name: 'period',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 365,
		},
		default: 7,
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['getSalesSummary'],
			},
		},
		description: 'Number of days to summarize (e.g. 7, 30, 90)',
	},

	// ── Stock Alerts — Fields ──
	{
		displayName: 'Stock Threshold',
		name: 'threshold',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 20,
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['getStockAlerts'],
			},
		},
		description: 'Maximum stock quantity to include in alerts (products with stock ≤ this value)',
	},
];
