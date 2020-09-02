import { IntegrationInstanceConfig } from '@jupiterone/integration-sdk-core';

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * The Customer ID obtained from https://manage.fastly.com/account/company
   */
  customerId: string;

  /**
   * The API Token created from https://manage.fastly.com/account/personal/tokens
   */
  apiToken: string;
}
