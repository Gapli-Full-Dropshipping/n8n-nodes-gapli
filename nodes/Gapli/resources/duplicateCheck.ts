import type { INodeProperties } from 'n8n-workflow';

export const duplicateCheckOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['duplicateCheck'],
			},
		},
		options: [
			{
				name: 'Check Product Identity',
				value: 'checkProductIdentity',
				description:
					'Multi-signal duplicate check — find existing Allegro offers matching a product by SKU, EAN, and/or name',
				action: 'Check product identity for duplicates',
			},
		],
		default: 'checkProductIdentity',
	},
];

export const duplicateCheckFields: INodeProperties[] = [
	// ── Check Product Identity — Inputs ──
	{
		displayName: 'SKU (Optional)',
		name: 'checkSku',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['duplicateCheck'],
				operation: ['checkProductIdentity'],
			},
		},
		description: 'Product SKU to check for duplicates (exact match)',
		placeholder: 'e.g. PROD-001-XL_350',
	},
	{
		displayName: 'EAN/GTIN (Optional)',
		name: 'checkEan',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['duplicateCheck'],
				operation: ['checkProductIdentity'],
			},
		},
		description: 'EAN/GTIN barcode to check for duplicates (exact match)',
		placeholder: 'e.g. 5901234123457',
	},
	{
		displayName: 'Product Name (Optional)',
		name: 'checkName',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['duplicateCheck'],
				operation: ['checkProductIdentity'],
			},
		},
		description: 'Product name for soft duplicate detection (partial match, case-insensitive)',
		placeholder: 'e.g. Bluetooth Speaker',
	},
	{
		displayName: 'Allegro Account Name or ID',
		name: 'checkAccountId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllegroAccounts',
		},
		default: 0,
		displayOptions: {
			show: {
				resource: ['duplicateCheck'],
				operation: ['checkProductIdentity'],
			},
		},
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
];
