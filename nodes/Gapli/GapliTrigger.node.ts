import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	INodePropertyOptions,
	ILoadOptionsFunctions,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { gapliApiRequest } from './GenericFunctions';

export class GapliTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'GAPLI Trigger',
		name: 'gapliTrigger',
		icon: { light: 'file:../../icons/gapli.svg', dark: 'file:../../icons/gapli.dark.svg' },
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description:
			'Triggers when events happen in GAPLI — new orders, status changes, new products',
		defaults: {
			name: 'GAPLI Trigger',
		},
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'gapliApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'newOrder',
				options: [
					{
						name: 'New Order',
						value: 'newOrder',
						description: 'Trigger when a new order is created',
					},
					{
						name: 'Order Status Changed',
						value: 'orderStatusChanged',
						description: 'Trigger when an order changes status',
					},
					{
						name: 'New Product',
						value: 'newProduct',
						description: 'Trigger when a new product appears in the catalog',
					},
				],
				description: 'The event to listen for',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Market Name or ID',
						name: 'marketFilter',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getMarkets',
						},
						default: 0,
						description: 'Only trigger for products/wholesalers from this market/region. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
						displayOptions: {
							show: {
								'/event': ['newProduct'],
							},
						},
					},
					{
						displayName: 'Order Status Filter',
						name: 'statusFilter',
						type: 'options',
						options: [
							{ name: 'All Statuses', value: '' },
							{ name: 'Cancelled', value: 'cancelled' },
							{ name: 'Delivered', value: 'delivered' },
							{ name: 'New', value: 'new' },
							{ name: 'Processing', value: 'processing' },
							{ name: 'Shipped', value: 'shipped' },
						],
						default: '',
						description: 'Only trigger for orders with this status (Order events only)',
						displayOptions: {
							show: {
								'/event': ['newOrder', 'orderStatusChanged'],
							},
						},
					},
					{
						displayName: 'Parser ID Filter',
						name: 'parserIdFilter',
						type: 'number',
						default: 0,
						description:
							'Only trigger for products from this parser/wholesaler (New Product event only)',
						displayOptions: {
							show: {
								'/event': ['newProduct'],
							},
						},
					},
				],
			},
		],
		usableAsTool: true,
	};

	methods = {
		loadOptions: {
			async getMarkets(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnData: INodePropertyOptions[] = [];
				try {
					const response = await gapliApiRequest.call(this, 'GET', '/markets');
					const markets = (response.markets as IDataObject[]) || [];

					returnData.push({
						name: '🌍 — All Markets —',
						value: 0,
						description: 'No market filter — trigger for all regions',
					});

					for (const m of markets) {
						const marketId = m.id as number;
						const name = m.name as string;
						const flag = (m.flag as string) || '🏳️';
						const currency = m.currency as string;
						if (marketId) {
							returnData.push({
								name: `${flag} ${name}`,
								value: marketId,
								description: `Market ID: ${marketId} · Currency: ${currency}`,
							});
						}
					}
				} catch {
					returnData.push({
						name: '🌍 — All Markets —',
						value: 0,
					});
				}
				return returnData;
			},
		},
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as string;
		const options = this.getNodeParameter('options', {}) as IDataObject;

		// Get last poll timestamp from workflow static data
		const workflowStaticData = this.getWorkflowStaticData('node');
		const lastTimestamp = workflowStaticData.lastTimestamp as string | undefined;
		const lastKnownIds = (workflowStaticData.lastKnownIds as number[]) || [];

		const now = new Date().toISOString();
		const returnData: INodeExecutionData[] = [];

		try {
			if (event === 'newOrder' || event === 'orderStatusChanged') {
				const qs: IDataObject = {
					limit: 50,
					offset: 0,
				};

				if (lastTimestamp) {
					qs.from = lastTimestamp;
				}

				if (options.statusFilter) {
					qs.status = options.statusFilter;
				}

				const response = await gapliApiRequest.call(this, 'GET', '/orders', {}, qs);
				const orders = (response.orders as IDataObject[]) || [];

				if (event === 'newOrder') {
					// Filter to only orders not seen before
					for (const order of orders) {
						const orderId = order.id as number;
						if (!lastKnownIds.includes(orderId)) {
							returnData.push({
								json: {
									...order,
									_event: 'newOrder',
									_triggeredAt: now,
								},
							});
						}
					}

					// Update known IDs (keep last 500 to prevent memory growth)
					const newIds = orders.map((o) => o.id as number);
					workflowStaticData.lastKnownIds = [
						...new Set([...lastKnownIds, ...newIds]),
					].slice(-500);
				} else {
					// orderStatusChanged — detect status changes
					const lastStatuses =
						(workflowStaticData.lastStatuses as Record<string, string>) || {};

					for (const order of orders) {
						const orderId = String(order.id);
						const currentStatus = order.status as string;
						const previousStatus = lastStatuses[orderId];

						if (previousStatus && previousStatus !== currentStatus) {
							returnData.push({
								json: {
									...order,
									_event: 'orderStatusChanged',
									_previousStatus: previousStatus,
									_newStatus: currentStatus,
									_triggeredAt: now,
								},
							});
						}

						lastStatuses[orderId] = currentStatus;
					}

					// Keep only last 1000 statuses
					const statusEntries = Object.entries(lastStatuses);
					if (statusEntries.length > 1000) {
						workflowStaticData.lastStatuses = Object.fromEntries(
							statusEntries.slice(-1000),
						);
					} else {
						workflowStaticData.lastStatuses = lastStatuses;
					}
				}
			} else if (event === 'newProduct') {
				const qs: IDataObject = {
					limit: 50,
					offset: 0,
				};

				if (options.parserIdFilter) {
					qs.parser_id = options.parserIdFilter;
				}

				// Market filter for new product detection
				const marketFilter = options.marketFilter as number | undefined;
				if (marketFilter && marketFilter > 0) {
					qs.market_id = marketFilter;
				}

				const response = await gapliApiRequest.call(this, 'GET', '/products', {}, qs);
				const products = (response.products as IDataObject[]) || [];

				// Detect new products by SKU
				const lastKnownSkus = (workflowStaticData.lastKnownSkus as string[]) || [];

				for (const product of products) {
					const sku = product.sku as string;
					if (sku && !lastKnownSkus.includes(sku)) {
						returnData.push({
							json: {
								...product,
								_event: 'newProduct',
								_triggeredAt: now,
							},
						});
					}
				}

				// Update known SKUs (keep last 2000)
				const newSkus = products.map((p) => p.sku as string).filter(Boolean);
				workflowStaticData.lastKnownSkus = [
					...new Set([...lastKnownSkus, ...newSkus]),
				].slice(-2000);
			}

			// Update last poll timestamp
			workflowStaticData.lastTimestamp = now;
		} catch (error) {
			// On first poll, set the timestamp and don't emit
			if (!lastTimestamp) {
				workflowStaticData.lastTimestamp = now;
				return null;
			}
			// On subsequent polls, re-throw so n8n shows the error in the UI
			throw error;
		}

		if (returnData.length === 0) {
			return null;
		}

		return [returnData];
	}
}
