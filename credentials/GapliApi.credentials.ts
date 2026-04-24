import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GapliApi implements ICredentialType {
	name = 'gapliApi';

	displayName = 'GAPLI API';

	icon: Icon = { light: 'file:../icons/gapli.svg', dark: 'file:../icons/gapli.dark.svg' };

	documentationUrl = 'https://gapli.com/dashboard/integrations-hub';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Your GAPLI API key. Generate one from Dashboard → Integrations → API Keys. Keys start with "gapli_".',
			placeholder: 'gapli_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://gapli.com',
			description: 'The base URL of your GAPLI instance. Change only for development/staging.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials?.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials?.baseUrl}}',
			url: '/api/v1/integrations/health',
			method: 'GET',
		},
	};
}
