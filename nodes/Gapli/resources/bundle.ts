import type { INodeProperties } from 'n8n-workflow';

export const bundleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['bundle'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a flexible bundle on one Allegro account',
				action: 'Create a flexible bundle',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a flexible bundle',
				action: 'Delete a flexible bundle',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get one bundle with its FULL slots — the list only returns one offer per slot',
				action: 'Get a flexible bundle',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description:
					'List flexible bundles across every Allegro account at once — one credential, no per-account OAuth',
				action: 'Get many flexible bundles',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Replace a bundle definition or change its discount',
				action: 'Update a flexible bundle',
			},
		],
		default: 'getAll',
	},
];

export const bundleFields: INodeProperties[] = [
	// ── Get Many ────────────────────────────────────────────────
	{
		displayName: 'Allegro Account Name or ID',
		name: 'bundleAccountId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllegroAccounts',
		},
		default: 0,
		displayOptions: {
			show: {
				resource: ['bundle'],
				operation: ['getAll'],
			},
		},
		description:
			'Leave empty to scan every active Allegro account in one request. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Hydrate Full Slots',
		name: 'bundleHydrate',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['bundle'],
				operation: ['getAll'],
			},
		},
		description:
			'Whether to fetch the complete slot list for each bundle. Off, Allegro returns only one representative offer per slot, so a three-product bundle looks exactly like a two-product one. Costs one extra Allegro request per bundle (capped at 50 per call).',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 1000,
		},
		default: 50,
		displayOptions: {
			show: {
				resource: ['bundle'],
				operation: ['getAll'],
			},
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Additional Fields',
		name: 'bundleListOptions',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['bundle'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				description:
					'Next-page cursor taken from accounts[].next_cursor. Bundles use cursor paging, not offsets, and a cursor belongs to ONE account — so this requires an account to be selected.',
			},
			{
				displayName: 'Offer ID',
				name: 'offer_id',
				type: 'string',
				default: '',
				description: 'Return only bundles that contain this Allegro offer',
			},
		],
	},

	// ── Get / Update / Delete — bundle identity ─────────────────
	{
		displayName: 'Bundle ID',
		name: 'bundleId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['bundle'],
				operation: ['get', 'update', 'delete'],
			},
		},
		description: 'Identifier of the flexible bundle, as returned by Get Many',
	},
	{
		displayName: 'Allegro Account Name or ID',
		name: 'bundleAccountIdRequired',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAllegroAccounts',
		},
		required: true,
		default: 0,
		displayOptions: {
			show: {
				resource: ['bundle'],
				operation: ['get', 'create', 'update', 'delete'],
			},
		},
		description:
			'Bundles live per account, and writes never fan out across accounts. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},

	// ── Create / Update — definition ────────────────────────────
	{
		displayName: 'Slots (JSON)',
		name: 'bundleSlots',
		type: 'json',
		required: true,
		default:
			'[\n  {"order": 0, "entryPoint": true, "requiredQuantity": 1, "offers": [{"id": "OFFER_ID_1"}]},\n  {"order": 1, "entryPoint": false, "requiredQuantity": 1, "offers": [{"id": "OFFER_ID_2"}]}\n]',
		displayOptions: {
			show: {
				resource: ['bundle'],
				operation: ['create', 'update'],
			},
		},
		description:
			'Slot definition exactly as Allegro expects it. At least two slots; each slot needs at least one offer ID.',
	},
	{
		displayName: 'Discount (JSON)',
		name: 'bundleDiscount',
		type: 'json',
		default: 'null',
		displayOptions: {
			show: {
				resource: ['bundle'],
				operation: ['create', 'update'],
			},
		},
		description:
			'Discount object, or null for a bundle without any discount for the buyer. WHOLE_BUNDLE_DISCOUNT keeps its percentages under bundle.discounts, SLOT_DISCOUNT under slot.slots[].discounts. Update replaces the whole bundle, so always state the discount explicitly.',
	},
];
