import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  StepStartStates,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from './provider/client';
import { FastlyUser, FastlyUserRole } from './provider/types';
import { IntegrationConfig } from './types';

function validateInvocationConfig(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { config } = context.instance;

  if (!config.customerId || !config.apiToken) {
    throw new IntegrationValidationError(
      'Config requires all of {customerId, apiToken}',
    );
  }
}

export default async function getStepStartStates(
  context: IntegrationExecutionContext<IntegrationConfig>,
): Promise<StepStartStates> {
  validateInvocationConfig(context);
  const { instance, logger } = context;
  const { config } = instance;

  const client = createAPIClient(config);

  let user: FastlyUser;
  try {
    user = await client.getCurrentUser();
  } catch (err) {
    throw new IntegrationProviderAuthenticationError({
      cause: err,
      endpoint: err.url,
      status: err.status,
      statusText: err.statusText,
    });
  }

  logger.info({ role: user.role }, 'Getting step start states using role');

  const isSuperUser = user.role === FastlyUserRole.SUPERUSER;
  const hasEngineerPrivileges =
    user.role === FastlyUserRole.ENGINEER || isSuperUser;

  return {
    'fetch-account': {
      // Every valid user type has the ability to ingest the account data
      disabled: false,
    },
    'fetch-users': {
      disabled: !hasEngineerPrivileges,
    },
    'fetch-services': {
      disabled: !hasEngineerPrivileges,
    },
    'fetch-tokens': {
      disabled: !isSuperUser,
    },
  };
}
