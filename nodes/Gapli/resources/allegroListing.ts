import type { INodeProperties } from 'n8n-workflow';

export const allegroListingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['allegroListing'],
			},
		},
		options: [
			{
				name: 'Send Products to Allegro',
				value: 'sendProducts',
				description:
					'Queue products for Allegro publication — inserts into system DB with pending status, CRON publishes automatically',
				action: 'Send products to allegro',
			},
			{
				name: 'Check Listing Readiness',
				value: 'checkReadiness',
				description:
					'Pre-flight check — validates account, partition, and product eligibility without side effects (dry run)',
				action: 'Check listing readiness',
			},
			{
				name: 'Get Listing Status',
				value: 'getStatus',
				description:
					'Check publication status of products on an Allegro account (pending/sent/active/error)',
				action: 'Get listing status',
			},
		],
		default: 'sendProducts',
	},
];

export const allegroListingFields: INodeProperties[] = [
	// ── Account ID (shared by all operations) ──
	{
		displayName: 'Allegro Account Name or ID',
		name: 'listingAccountId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllegroAccounts',
		},
		required: true,
		default: 0,
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['allegroListing'],
			},
		},
	},

	// ── Product SKUs (send + check-readiness) ──
	{
		displayName: 'Product SKUs',
		name: 'listingSkus',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		required: true,
		default: '',
		placeholder: 'SKU1_123\nSKU2_123\nSKU3_456',
		description:
			'Product SKU codes to list on Allegro. One per line or comma-separated. Max 10,000 per request.',
		displayOptions: {
			show: {
				resource: ['allegroListing'],
				operation: ['sendProducts', 'checkReadiness'],
			},
		},
	},

	// ── Optional SKUs for getStatus ──
	{
		displayName: 'Product SKUs (Optional)',
		name: 'statusSkus',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		placeholder: 'Leave empty to get all products for this account',
		description:
			'Optional: filter status check to specific SKUs. Leave empty to return all products on the account.',
		displayOptions: {
			show: {
				resource: ['allegroListing'],
				operation: ['getStatus'],
			},
		},
	},

	// ── Dry Run toggle (sendProducts only) ──
	{
		displayName: 'Dry Run',
		name: 'listingDryRun',
		type: 'boolean',
		default: false,
		description:
			'Whether to simulate without writing to database. Returns what would happen (saved/skipped counts) without side effects.',
		displayOptions: {
			show: {
				resource: ['allegroListing'],
				operation: ['sendProducts'],
			},
		},
	},

	// ── Shipping Rate ID (optional) ──
	{
		displayName: 'Shipping Rate ID',
		name: 'listingShippingRateId',
		type: 'string',
		default: '',
		placeholder: 'Leave empty for auto-match',
		description:
			'Allegro shipping rate ID. Leave empty to auto-match based on product dimensions and wholesaler configuration.',
		displayOptions: {
			show: {
				resource: ['allegroListing'],
				operation: ['sendProducts'],
			},
		},
	},

	// ── Price Range ──
	{
		displayName: 'Min Price (Gross PLN)',
		name: 'listingPriceMin',
		type: 'number',
		default: 50,
		description: 'Minimum gross price in PLN. Products below this are skipped.',
		displayOptions: {
			show: {
				resource: ['allegroListing'],
				operation: ['sendProducts'],
			},
		},
	},
	{
		displayName: 'Max Price (Gross PLN)',
		name: 'listingPriceMax',
		type: 'number',
		default: 50000,
		description: 'Maximum gross price in PLN. Products above this are skipped.',
		displayOptions: {
			show: {
				resource: ['allegroListing'],
				operation: ['sendProducts'],
			},
		},
	},

	// ── Limit for getStatus ──
	{
		displayName: 'Limit',
		name: 'statusLimit',
		type: 'number',
		default: 100,
		description: 'Max number of products to return in status check',
		displayOptions: {
			show: {
				resource: ['allegroListing'],
				operation: ['getStatus'],
			},
		},
	},
];
