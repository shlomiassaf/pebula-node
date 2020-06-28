import { ModuleMetadata } from '@nestjs/common/interfaces';
import { ServiceBusModule, SbModuleRegisterOptions } from '@pebula/attribus/nestjs';
import { NoopLogger } from '../../../src/utils';
import { createServerOptions } from '../../__env';
import { ConfigService } from './services';

export function createServiceBusModule(moduleMetadata: ModuleMetadata = {}, opts?: Pick<SbModuleRegisterOptions, 'metadataTransformer' | 'providers'>) {
  const serviceBusModule = ServiceBusModule.register({
    servers: {
      useFactory: createServerOptions,
      inject: [ConfigService],
    },
    clients: [
      {
        logger: NoopLogger.shared, // createLogger('SbClient: default'),
      },
    ],
    ...(opts || {}),
  });

  return {
    ...moduleMetadata,
    imports: [ serviceBusModule, ...(moduleMetadata.imports || []) ],
  };
}
