import {
  createMockStepExecutionContext,
  setupRecording,
  Recording,
} from '@jupiterone/integration-sdk-testing';

import { IntegrationConfig } from '../types';
import { fetchTokens, fetchUsers } from './access';
import { fetchAccountDetails } from './account';
import { fetchServices } from './services';

const DEFAULT_CUSTOMER_ID = 'abc';
const DEFAULT_API_TOKEN = 'xyz';

const integrationConfig: IntegrationConfig = {
  customerId: process.env.CUSTOMER_ID || DEFAULT_CUSTOMER_ID,
  apiToken: process.env.API_TOKEN || DEFAULT_API_TOKEN,
};

jest.setTimeout(10000 * 2);

test('should collect data', async () => {
  const context = createMockStepExecutionContext<IntegrationConfig>({
    instanceConfig: integrationConfig,
  });

  await fetchAccountDetails(context);
  await fetchUsers(context);
  await fetchTokens(context);
  await fetchServices(context);

  // Review snapshot, failure is a regression
  expect({
    numCollectedEntities: context.jobState.collectedEntities.length,
    numCollectedRelationships: context.jobState.collectedRelationships.length,
    collectedEntities: context.jobState.collectedEntities,
    collectedRelationships: context.jobState.collectedRelationships,
    encounteredTypes: context.jobState.encounteredTypes,
  }).toMatchSnapshot();

  expect(
    context.jobState.collectedEntities.filter((e) =>
      e._class.includes('Account'),
    ),
  ).toMatchGraphObjectSchema({
    _class: ['Account'],
    schema: {
      additionalProperties: true,
      properties: {
        _type: { const: 'fastly_account' },
        name: { type: 'string' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
      },
      required: ['name'],
    },
  });

  expect(
    context.jobState.collectedEntities.filter((e) => e._class.includes('User')),
  ).toMatchGraphObjectSchema({
    _class: ['User'],
    schema: {
      additionalProperties: true,
      properties: {
        _type: { const: 'fastly_user' },
        name: { type: 'string' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
      },
      required: ['name'],
    },
  });

  expect(
    context.jobState.collectedEntities.filter((e) =>
      e._class.includes('AccessKey'),
    ),
  ).toMatchGraphObjectSchema({
    _class: ['AccessKey'],
    schema: {
      additionalProperties: true,
      properties: {
        _type: { const: 'fastly_api_token' },
        userId: { type: 'string' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
      },
      required: ['userId'],
    },
  });

  expect(
    context.jobState.collectedEntities.filter((e) =>
      e._class.includes('Service'),
    ),
  ).toMatchGraphObjectSchema({
    _class: ['Service'],
    schema: {
      additionalProperties: true,
      properties: {
        _type: { const: 'fastly_service' },
        name: { type: 'string' },
        version: { type: 'number' },
        _rawData: {
          type: 'array',
          items: { type: 'object' },
        },
      },
      required: ['name', 'version'],
    },
  });
});
