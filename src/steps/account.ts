import {
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  getTime,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import { createAPIClient } from '../provider/client';

export async function fetchAccountDetails({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  const data = await apiClient.getAccountDetails();

  const accountEntity = createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _type: 'fastly_account',
        _class: 'Account',
        _key: `fastly-account:${data.id}`,
        id: data.id,
        displayName: data.name || data.id,
        name: data.name,
        address: data.postal_address,
        phone: data.phone_number,
        mfaEnabled: data.force_2fa,
        mfaEnforced: data.force_2fa,
        ssoEnforced: data.force_sso,
        readOnly: data.readonly,
        ownerId: data.owner_id,
        ipWhitelist: data.ip_whitelist,
        rateLimit: data.rate_limit,
        createdOn: getTime(data.created_at),
        updatedOn: getTime(data.updated_at),
        deletedOn: getTime(data.deleted_at),
      },
    },
  });

  await Promise.all([
    jobState.addEntity(accountEntity),
    jobState.setData(accountEntity._key, accountEntity),
  ]);
}

export const accountSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-account',
    name: 'Fetch Account Details',
    entities: [
      {
        resourceName: 'Account',
        _type: 'fastly_account',
        _class: 'Account',
      },
    ],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAccountDetails,
  },
];
