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
				name: 'Get Global Category Trends',
				value: 'getGlobalCategoryTrends',
				description: 'Get wholesaler/category popularity trends with up/down/stable indicators',
				action: 'Get global category trends',
			},
			{
				name: 'Get Global Price Benchmarks',
				value: 'getGlobalPriceBenchmarks',
				description: 'Get average/min/max gross prices per wholesaler for price benchmarking',
				action: 'Get global price benchmarks',
			},
			{
				name: 'Get Global Top Products',
				value: 'getGlobalTopProducts',
				description: 'Get platform-wide best-selling products across all operators (anonymized)',
				action: 'Get global top products',
			},
			{
				name: 'Get Marketplace Health',
				value: 'getMarketplaceHealth',
				description: 'Get health status of marketplace accounts (Allegro offer stats)',
				action: 'Get marketplace health',
			},
			{
				name: 'Get Platform Stats',
				value: 'getPlatformStats',
				description: 'Get platform-wide statistics: total orders, active operators, catalog size',
				action: 'Get platform stats',
			},
			{
				name: 'Get Sales Summary',
				value: 'getSalesSummary',
				description: 'Get aggregated sales summary with daily breakdown for your account',
				action: 'Get sales summary',
			},
			{
				name: 'Get Stock Alerts',
				value: 'getStockAlerts',
				description: 'Get products with critically low stock (includes days-until-stockout)',
				action: 'Get stock alerts',
			},
			{
				name: 'Get Top Products',
				value: 'getTopProducts',
				description: 'Get the best-selling products for your account in a given period',
				action: 'Get top selling products',
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

	// ── Global Top Products — Fields ──
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
				operation: ['getGlobalTopProducts'],
			},
		},
		description: 'Number of days to analyze for global top products (e.g. 7, 30, 90)',
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
				operation: ['getGlobalTopProducts'],
			},
		},
		description: 'Max number of results to return',
	},

	// ── Global Category Trends — Fields ──
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
				operation: ['getGlobalCategoryTrends'],
			},
		},
		description: 'Number of days for the current and previous comparison period',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 50,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['getGlobalCategoryTrends'],
			},
		},
		description: 'Max number of results to return',
	},

	// ── Global Price Benchmarks — Fields ──
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 50,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['analytics'],
				operation: ['getGlobalPriceBenchmarks'],
			},
		},
		description: 'Max number of results to return',
	},
];
