import { ServiceBusClient } from '@azure/service-bus';
import * as errors from '../errors';
import { SbServer } from '../server';
import { SbServerOptions, SbClientOptions, SbEmitterRef } from '../interfaces';
import { SbConfigurator, createManagementClientAdapter } from '../management';

export function createServiceBusClient(clientOptions: SbServerOptions['client']): ServiceBusClient {
  const { credentials, options } = clientOptions;
  if ('connectionString' in credentials) {
    return ServiceBusClient.createFromConnectionString(credentials.connectionString, options);
  }
  if ('tokenProvider' in credentials) {
    return ServiceBusClient.createFromTokenProvider(credentials.host, credentials.tokenProvider, options);
  }
  if ('credentials' in credentials) {
    return ServiceBusClient.createFromAadTokenCredentials(credentials.host, credentials.credentials as any, options);
  }
  throw new Error('Invalid credentials.');
}

export function createServerConnector(config: SbServerOptions) {
  if (!config.client || !config.client.credentials) {
    throw errors.invalidOrMissingConfiguration('SbServerOptions.client', 'Connection credentials are mandatory.');
  }

  const result: { client: ServiceBusClient, configurator?: SbConfigurator } = {
    client: createServiceBusClient(config.client),
  };

  if (config.management) {
    const managementClient = createManagementClientAdapter(config.management);
    result.configurator = new SbConfigurator(managementClient, config);
  }
  return result;
}

export function createClientConnector(config: SbClientOptions, server?: SbServer) {
  if (!server && !config.client) {
    throw errors.invalidOrMissingConfiguration(
      'SbClientOptions.client',
      'Connection credentials are missing and no matching server found for the identity',
    );
  }

  const result: { client: ServiceBusClient, configurator?: SbConfigurator } = {
    client: config.client ? createServiceBusClient(config.client) : server.client,
  };

  if (config.management) {
    const managementClient = createManagementClientAdapter(config.management);
    result.configurator = new SbConfigurator(managementClient, config);
  } else if (server) {
    result.configurator = server.configurator;
  }

  return result;
}

export function isSbEmitterRef(obj: any): obj is SbEmitterRef {
  if ('name' in obj && !('send' in obj)) {
    return true;
  }
}
