import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { gapliApiRequest, gapliApiRequestAllItems } from './GenericFunctions';
import { productOperations, productFields } from './resources/product';
import { orderOperations, orderFields } from './resources/order';
import { wholesalerOperations, wholesalerFields } from './resources/wholesaler';
import { marketplaceOperations, marketplaceFields } from './resources/marketplace';
import { storeOperations, storeFields } from './resources/store';
import { industryOperations, industryFields } from './resources/industry';
import { analyticsOperations, analyticsFields } from './resources/analytics';

export class Gapli implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GAPLI',
		name: 'gapli',
		icon: { light: 'file:../../icons/gapli.svg', dark: 'file:../../icons/gapli.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Interact with the GAPLI Dropshipping Platform — manage products, orders, wholesalers, and marketplace accounts',
		defaults: {
			name: 'GAPLI',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'gapliApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials?.baseUrl}}/api/v1/integrations',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Analytics',
						value: 'analytics',
						description:
							'Sales analytics: top products, revenue summary, stock alerts, marketplace health',
					},
					{
						name: 'Health',
						value: 'health',
						description: 'Check the GAPLI API status',
					},
					{
						name: 'Industry',
						value: 'industry',
						description: 'View available industries/categories for marketing filtering',
					},
					{
						name: 'Marketplace',
						value: 'marketplace',
						description:
							'Manage marketplace accounts (Allegro, Erli) and their products',
					},
					{
						name: 'Order',
						value: 'order',
						description: 'Manage customer orders',
					},
					{
						name: 'Product',
						value: 'product',
						description: 'Manage products from your catalog',
					},
					{
						name: 'Store',
						value: 'store',
						description:
							'View your connected online stores (WooCommerce, PrestaShop, etc.)',
					},
					{
						name: 'Wholesaler',
						value: 'wholesaler',
						description: 'View available wholesalers and suppliers',
					},
				],
				default: 'product',
			},
			// Health — no operation needed
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'hidden',
				default: 'check',
				displayOptions: {
					show: {
						resource: ['health'],
					},
				},
			},
			// Resource operations and fields
			...productOperations,
			...productFields,
			...orderOperations,
			...orderFields,
			...wholesalerOperations,
			...wholesalerFields,
			...marketplaceOperations,
			...marketplaceFields,
			...storeOperations,
			...storeFields,
			...industryOperations,
			...industryFields,
			...analyticsOperations,
			...analyticsFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				// ─── Product ────────────────────────────────────────────
				if (resource === 'product') {
					if (operation === 'get') {
						const sku = this.getNodeParameter('sku', i) as string;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							`/products/${encodeURIComponent(sku)}`,
						);
						responseData = (response.product as IDataObject) || response;
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = {};

						if (filters.parser_id) qs.parser_id = filters.parser_id;
						if (filters.sku) qs.sku = filters.sku;
						if (filters.search) qs.search = filters.search;
						if (filters.available) qs.available = 'true';

						if (returnAll) {
							responseData = await gapliApiRequestAllItems.call(
								this,
								'GET',
								'/products',
								'products',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.offset = 0;
							const response = await gapliApiRequest.call(
								this,
								'GET',
								'/products',
								{},
								qs,
							);
							responseData = (response.products as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i },
						);
					}
				}

				// ─── Order ──────────────────────────────────────────────
				else if (resource === 'order') {
					if (operation === 'get') {
						const orderId = this.getNodeParameter('orderId', i) as number;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							`/orders/${orderId}`,
						);
						responseData = (response.order as IDataObject) || response;
					} else if (operation === 'getAll') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = {};

						if (filters.status) qs.status = filters.status;
						if (filters.from) qs.from = filters.from;
						if (filters.to) qs.to = filters.to;

						if (returnAll) {
							responseData = await gapliApiRequestAllItems.call(
								this,
								'GET',
								'/orders',
								'orders',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.offset = 0;
							const response = await gapliApiRequest.call(
								this,
								'GET',
								'/orders',
								{},
								qs,
							);
							responseData = (response.orders as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i },
						);
					}
				}

				// ─── Wholesaler ──────────────────────────────────────────
				else if (resource === 'wholesaler') {
					const activeOnly = this.getNodeParameter('activeOnly', i, true) as boolean;
					const qs: IDataObject = { active: activeOnly ? 'true' : 'false' };
					const response = await gapliApiRequest.call(
						this,
						'GET',
						'/wholesalers',
						{},
						qs,
					);
					responseData = (response.wholesalers as IDataObject[]) || [];
				}

				// ─── Marketplace ─────────────────────────────────────────
				else if (resource === 'marketplace') {
					if (operation === 'getAccounts') {
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/marketplace/accounts',
						);
						responseData = (response.accounts as IDataObject[]) || [];
					} else if (operation === 'getProducts') {
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const qs: IDataObject = {};

						if (filters.account_id) qs.account_id = filters.account_id;
						if (filters.platform) qs.platform = filters.platform;
						if (filters.status) qs.status = filters.status;

						if (returnAll) {
							responseData = await gapliApiRequestAllItems.call(
								this,
								'GET',
								'/marketplace/products',
								'products',
								{},
								qs,
							);
						} else {
							const limit = this.getNodeParameter('limit', i) as number;
							qs.limit = limit;
							qs.offset = 0;
							const response = await gapliApiRequest.call(
								this,
								'GET',
								'/marketplace/products',
								{},
								qs,
							);
							responseData = (response.products as IDataObject[]) || [];
						}
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i },
						);
					}
				}

				// ─── Store ───────────────────────────────────────────────
				else if (resource === 'store') {
					const response = await gapliApiRequest.call(this, 'GET', '/stores');
					responseData = (response.stores as IDataObject[]) || [];
				}

				// ─── Industry ────────────────────────────────────────────
				else if (resource === 'industry') {
					const response = await gapliApiRequest.call(this, 'GET', '/industries');
					responseData = (response.industries as IDataObject[]) || [];
				}

				// ─── Analytics ───────────────────────────────────────────
				else if (resource === 'analytics') {
					if (operation === 'getTopProducts') {
						const period = this.getNodeParameter('period', i) as number;
						const limit = this.getNodeParameter('limit', i) as number;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/top-products',
							{},
							{ period, limit },
						);
						responseData = (response.products as IDataObject[]) || [];
					} else if (operation === 'getSalesSummary') {
						const period = this.getNodeParameter('period', i) as number;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/sales-summary',
							{},
							{ period },
						);
						responseData = (response.summary as IDataObject) || response;
					} else if (operation === 'getStockAlerts') {
						const threshold = this.getNodeParameter('threshold', i) as number;
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/stock-alerts',
							{},
							{ threshold },
						);
						responseData = (response.alerts as IDataObject[]) || [];
					} else if (operation === 'getMarketplaceHealth') {
						const response = await gapliApiRequest.call(
							this,
							'GET',
							'/analytics/marketplace-health',
						);
						responseData = (response.accounts as IDataObject[]) || [];
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i },
						);
					}
				}

				// ─── Health ──────────────────────────────────────────────
				else if (resource === 'health') {
					responseData = await gapliApiRequest.call(this, 'GET', '/health');
				}

				// ─── Unknown ─────────────────────────────────────────────
				else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource: ${resource}`,
						{ itemIndex: i },
					);
				}

				// Normalize output
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
