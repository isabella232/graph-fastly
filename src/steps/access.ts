import {
  createDirectRelationship,
  createIntegrationEntity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
  getTime,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../provider/client';
import { IntegrationConfig } from '../types';

export async function fetchUsers({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  await apiClient.getUsers(async (data) => {
    await jobState.addEntity(
      createIntegrationEntity({
        entityData: {
          source: data,
          assign: {
            _type: 'fastly_user',
            _class: 'User',
            _key: `fastly-user:${data.id}`,
            id: data.id,
            displayName: data.name || data.id,
            name: data.name,
            username: data.login,
            login: data.login,
            role: data.role,
            admin: data.role === 'superuser',
            mfaEnabled: data.two_factor_auth_enabled,
            mfaSetupRequired: data.two_factor_setup_required,
            locked: data.locked,
            active: !(data.deleted_at || data.locked),
            createdOn: getTime(data.created_at),
            updatedOn: getTime(data.updated_at),
            deletedOn: getTime(data.deleted_at),
          },
        },
      }),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        fromKey: `fastly-account:${instance.config.customerId}`,
        fromType: 'fastly_account',
        toKey: `fastly-user:${data.id}`,
        toType: 'fastly_user',
      }),
    );
  });
}

export async function fetchTokens({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);

  await apiClient.getTokens(async (data) => {
    await jobState.addEntity(
      createIntegrationEntity({
        entityData: {
          source: data,
          assign: {
            _type: 'fastly_api_token',
            _class: 'AccessKey',
            _key: `fastly-api-token:${data.id}`,
            id: data.id,
            displayName: data.name || data.id,
            name: data.name,
            ip: data.ip,
            userAgent: data.user_agent,
            scope: data.scope,
            scopes: data.scopes,
            services: data.services,
            userId: data.user_id,
            createdOn: getTime(data.created_at),
            expiresOn: getTime(data.expires_at),
            sudoExpiresOn: getTime(data.sudo_expires_at),
            lastUsedOn: getTime(data.last_used_at),
            lastUsedAt: data.ip,
            lastUsedBy: data.user_agent,
          },
        },
      }),
    );

    const from = data.user_id
      ? {
          _key: `fastly-user:${data.user_id}`,
          _type: 'fastly_user',
        }
      : {
          _key: `fastly-account:${instance.config.customerId}`,
          _type: 'fastly-account',
        };

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        fromKey: from._key,
        fromType: from._type,
        toKey: `fastly-api-token:${data.id}`,
        toType: 'fastly_api_token',
      }),
    );
  });
}

export const accessSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: 'fetch-users',
    name: 'Fetch Users',
    entities: [
      {
        resourceName: 'User',
        _type: 'fastly_user',
        _class: 'User',
      },
    ],
    relationships: [
      {
        _type: 'fastly_account_has_user',
        _class: RelationshipClass.HAS,
        sourceType: 'fastly_account',
        targetType: 'fastly_user',
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchUsers,
  },
  {
    id: 'fetch-tokens',
    name: 'Fetch API Tokens',
    entities: [
      {
        resourceName: 'API Token',
        _type: 'fastly_api_token',
        _class: 'AccessKey',
      },
    ],
    relationships: [
      {
        _type: 'fastly_account_has_api_token',
        _class: RelationshipClass.HAS,
        sourceType: 'fastly_account',
        targetType: 'fastly_api_token',
      },
      {
        _type: 'fastly_user_has_api_token',
        _class: RelationshipClass.HAS,
        sourceType: 'fastly_user',
        targetType: 'fastly_api_token',
      },
    ],
    dependsOn: ['fetch-account'],
    executionHandler: fetchTokens,
  },
];
