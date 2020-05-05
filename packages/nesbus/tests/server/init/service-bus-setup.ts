import { Logger } from '@nestjs/common';
import { ApplicationTokenCredentials } from '@azure/ms-rest-nodeauth';

import { ServiceBusModule, SbServerOptions } from '@pebula/nesbus';
import { registerArmAdapter } from '@pebula/nesbus/arm-adapter';
import { SB_BACKOFF_RETRY_DEFAULTS, SbBackoffRetryOptions } from '@pebula/nesbus/tasks';

import { ConfigService, ServiceBusEntityConfigurator } from '../services';

function createClient(client: ReturnType<ConfigService['sbConnection']>['client']): SbServerOptions['client'] {
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

function createManagement(management: ReturnType<ConfigService['sbConnection']>['management'], config: ConfigService): SbServerOptions['management'] {
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

function createServerOptions(config: ConfigService) {
  const { client, management } = config.sbConnection();
  const sbServerOptions: SbServerOptions = {
    client: createClient(client),
    management: createManagement(management, config),
    logger: new Logger('SbServer: default'),
  };
  return [ sbServerOptions ];
}

export function createServiceBusModule() {
  const serviceBusModule = ServiceBusModule.register({
    servers: {
      useFactory: createServerOptions,
      inject: [ConfigService],
    },
    clients: [
      {
        logger: new Logger('SbClient: default'),
      },
    ],
    metaFactoryProvider: ServiceBusEntityConfigurator,
  });
  const providers = [
    {
      provide: SB_BACKOFF_RETRY_DEFAULTS,
      useValue: {
        retryCount: 3,
      } as SbBackoffRetryOptions,
    },
  ];
  return {
    imports: [ serviceBusModule ],
    providers,
  };
}
