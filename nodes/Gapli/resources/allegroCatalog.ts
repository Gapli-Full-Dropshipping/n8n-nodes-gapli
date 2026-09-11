import type { INodeProperties } from 'n8n-workflow';

export const allegroCatalogOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['allegroCatalog'],
			},
		},
		options: [
			{
				name: 'Lookup by EAN',
				value: 'lookupByEan',
				description:
					'Search Allegro product catalog by EAN/GTIN barcode — returns official product cards from Allegro',
				action: 'Lookup allegro catalog product by EAN',
			},
			{
				name: 'Search by Phrase',
				value: 'searchByPhrase',
				description:
					'Search Allegro product catalog by keyword/phrase — returns matching product cards',
				action: 'Search allegro catalog by phrase',
			},
			{
				name: 'Get Category Parameters',
				value: 'getCategoryParameters',
				description:
					'Get required and optional parameters for an Allegro category — needed for listing creation',
				action: 'Get allegro category parameters',
			},
		],
		default: 'lookupByEan',
	},
];

export const allegroCatalogFields: INodeProperties[] = [
	// ── Common: Account ID (required for all catalog operations) ──
	{
		displayName: 'Allegro Account Name or ID',
		name: 'catalogAccountId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllegroAccounts',
		},
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['allegroCatalog'],
			},
		},
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},

	// ── Lookup by EAN ──
	{
		displayName: 'EAN/GTIN',
		name: 'catalogEan',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['allegroCatalog'],
				operation: ['lookupByEan'],
			},
		},
		description: 'EAN/GTIN barcode to search in Allegro product catalog',
		placeholder: 'e.g. 5901234123457',
	},

	// ── Search by Phrase ──
	{
		displayName: 'Search Phrase',
		name: 'catalogPhrase',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['allegroCatalog'],
				operation: ['searchByPhrase'],
			},
		},
		description: 'Keyword or phrase to search in Allegro product catalog',
		placeholder: 'e.g. Samsung Galaxy S24',
	},
	{
		displayName: 'Limit',
		name: 'catalogLimit',
		type: 'number',
		default: 10,
		displayOptions: {
			show: {
				resource: ['allegroCatalog'],
				operation: ['searchByPhrase'],
			},
		},
		description: 'Max number of results to return (1-50, default: 10)',
		typeOptions: {
			minValue: 1,
			maxValue: 50,
		},
	},

	// ── Get Category Parameters ──
	{
		displayName: 'Category ID',
		name: 'catalogCategoryId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['allegroCatalog'],
				operation: ['getCategoryParameters'],
			},
		},
		description:
			'Allegro category ID. You can find this in the category field of catalog lookup results.',
		placeholder: 'e.g. 257732',
	},
];
