import axios from 'axios';

import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../types';
import {
  FastlyUser,
  FastlyAccount,
  FastlyService,
  FastlyServiceBackend,
  FastlyServiceDomain,
  FastlyToken,
} from './types';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

const HOSTNAME = 'api.fastly.com';

export class APIClient {
  private _config: IntegrationConfig;

  constructor(readonly config: IntegrationConfig) {
    this._config = config;
  }

  private async getData<T>(path: string, args?: object): Promise<T> {
    const url = `https://${HOSTNAME}${path.startsWith('/') ? '' : '/'}${path}`;
    try {
      const { data } = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          'Fastly-Key': this._config.apiToken,
        },
        params: args,
      });
      return data;
    } catch (err) {
      const response = err.response || {};
      throw Object.assign(new Error(err.message), {
        url: url,
        status: response.status || err.status || 'UNKNOWN',
        statusText: response.statusText || err.statusText || 'UNKNOWN',
      });
    }
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      const { id } = await this.getData('/current_customer');
      if (id !== this._config.customerId) {
        throw new IntegrationProviderAuthenticationError({
          endpoint: '/current_customer',
          status: 200,
          statusText: 'Incorrect Customer Id',
        });
      }
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: err.url,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  public async getAccountDetails(): Promise<FastlyAccount> {
    return this.getData<FastlyAccount>(`/customer/${this._config.customerId}`);
  }

  public async getUsers(iteratee: ResourceIteratee<FastlyUser>): Promise<void> {
    const items = await this.getData<FastlyUser[]>(
      `/customer/${this._config.customerId}/users`,
    );
    for (const item of items) {
      await iteratee(item);
    }
  }

  public async getTokens(
    iteratee: ResourceIteratee<FastlyToken>,
  ): Promise<void> {
    const items = await this.getData<FastlyToken[]>(
      `/customer/${this._config.customerId}/tokens`,
    );
    for (const item of items) {
      await iteratee(item);
    }
  }

  public async getServices(
    iteratee: ResourceIteratee<FastlyService>,
  ): Promise<void> {
    const items = await this.getData<FastlyService[]>(`/service`);
    for (const item of items) {
      await iteratee(item);
    }
  }

  public async getServiceBackends(
    id: string,
    version: number,
  ): Promise<FastlyServiceBackend[]> {
    return await this.getData<FastlyServiceBackend[]>(
      `/service/${id}/version/${version}/backend`,
    );
  }

  public async getServiceDomains(
    id: string,
    version: number,
  ): Promise<FastlyServiceDomain[]> {
    return await this.getData<FastlyServiceDomain[]>(
      `/service/${id}/version/${version}/domain`,
    );
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
