import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import type { JsonObject } from 'n8n-workflow';

/**
 * Make an authenticated request to the GAPLI API.
 */
export async function gapliApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('gapliApi');
	const baseUrl = (credentials.baseUrl as string) || 'https://gapli.com';

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/api/v1/integrations${endpoint}`,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		qs,
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'gapliApi',
			options,
		);
		return response as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as unknown as JsonObject, {
			message: 'GAPLI API request failed',
		});
	}
}

/**
 * Make an authenticated request to the GAPLI API and return all items
 * using pagination (offset-based).
 */
export async function gapliApiRequestAllItems(
	this: IExecuteFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	propertyName: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let offset = 0;
	const limit = 100;

	let responseData: IDataObject;

	do {
		qs.limit = limit;
		qs.offset = offset;

		responseData = await gapliApiRequest.call(this, method, endpoint, body, qs);

		const items = responseData[propertyName] as IDataObject[] | undefined;
		if (items) {
			returnData.push(...items);
		}

		offset += limit;

		const pagination = responseData.pagination as IDataObject | undefined;
		if (!pagination || !(pagination.has_more as boolean)) {
			break;
		}
	} while (true);

	return returnData;
}
