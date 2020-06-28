import { ApplicationTokenCredentials } from '@azure/ms-rest-nodeauth';

import { SbServerOptions } from '@pebula/attribus';
import { registerArmAdapter } from '@pebula/attribus/arm-adapter';
import { NoopLogger } from '../../src/utils';

import { ConfigService } from './services';

export function createLogger(name: string) {
  // return new Logger(name);
  return {
    log: msg => console.log(`[${name}]: ${msg}`),
    error: msg => console.error(`[${name}]: ${msg}`),
    warn: msg => console.warn(`[${name}]: ${msg}`),
    debug: msg => console.log(`[${name}]: ${msg}`),
    verbose: msg => console.log(`[${name}]: ${msg}`),
  };
}

export function createClient(client: ReturnType<ConfigService['sbConnection']>['client']): SbServerOptions['client'] {
  if (client.type === 'connectionString') {
    return {
      credentials: {
        connectionString: client.sasConnectionString,
      },
    };
  } else {
    return {
      credentials: {
        host: client.host,
        credentials: new ApplicationTokenCredentials(
          client.credentials.clientId,
          client.credentials.tenantId,
          client.credentials.clientSecret,
        )
      }
    };
  }
}

export function createManagement(management: ReturnType<ConfigService['sbConnection']>['management'], config: ConfigService): SbServerOptions['management'] {
  const defaults = config.sbDefaultsAdapter();
  if (management.type === 'connectionString') {
    return {
      credentials: {
        connectionString: management.sasConnectionString,
      },
      defaults,
    };
  } else {
    registerArmAdapter();
    return  {
      credentials: {
        host: management.host,
        resourceGroupName: management.resourceGroupName,
        namespace: management.namespace,
        subscriptionId: management.subscriptionId,
        credentials: new ApplicationTokenCredentials(
          management.credentials.clientId,
          management.credentials.tenantId,
          management.credentials.clientSecret,
        ),
      },
      defaults,
    };
  }
}

export function createServerOptions(config: ConfigService) {
  const { client, management } = config.sbConnection();
  const sbServerOptions: SbServerOptions = {
    client: createClient(client),
    management: createManagement(management, config),
    logger: NoopLogger.shared, // createLogger('SbServer: default'),
  };
  return [ sbServerOptions ];
}
