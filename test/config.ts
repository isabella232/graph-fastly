import { IntegrationConfig } from '../src/types';

const DEFAULT_CUSTOMER_ID = '6Bfjl1cR8HV2hPuQykFxJa';
const DEFAULT_API_TOKEN = 'xyz';

export const integrationConfig: IntegrationConfig = {
  customerId: process.env.CUSTOMER_ID || DEFAULT_CUSTOMER_ID,
  apiToken: process.env.API_TOKEN || DEFAULT_API_TOKEN,
};
