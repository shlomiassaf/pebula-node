import { Module, OnModuleInit, Optional, Inject, DynamicModule, Provider, OnModuleDestroy, Type } from '@nestjs/common';
import { SbServerOptions, SbClientOptions, SbErrorHandler } from '@pebula/attribus';
import { SB_CLIENT_OPTIONS, SB_SERVER_OPTIONS, ATTRIBUS_METADATA_TRANSFORMER } from './constants';
import { SbModuleRegisterOptions, MetadataTransformer,  } from './interfaces';
import { SbDiscoveryFactoryService } from './discovery';
import { NestAttribusManager } from './manager';

function normalizeProvider(provider: Omit<Exclude<Provider<MetadataTransformer>, Type<MetadataTransformer>>, 'provide'> | Type<MetadataTransformer>): Provider {
  if (typeof provider === 'function') {
    provider = { provide: ATTRIBUS_METADATA_TRANSFORMER, useClass: provider };
  }
  return {
    ...(provider as Exclude<Provider, Type<any>>),
    provide: ATTRIBUS_METADATA_TRANSFORMER,
  };
}

@Module({
  providers: [
    SbDiscoveryFactoryService,
  ],
})
export class ServiceBusModule implements OnModuleInit, OnModuleDestroy {

  /**
   * Register a service bus server/s that will be used as the underlying resources to generate `Queue` & `Subscription` listeners.
   *
   * You can provide multiple server configurations, however make sure that each of them has a unique name.
   * Note that not setting a name is a unique name by itself.
   *
   */
  static register(options: SbModuleRegisterOptions): DynamicModule {
    const providers: Provider[] = [];

    if (Array.isArray(options.servers)) {
      providers.push({
        provide: SB_SERVER_OPTIONS,
        useValue: options.servers,
      });
    } else {
      providers.push({
        provide: SB_SERVER_OPTIONS,
        ...options.servers,
      });
    }

    if (Array.isArray(options.clients)) {
      providers.push({
        provide: SB_CLIENT_OPTIONS,
        useValue: options.clients,
      });
    } else {
      providers.push({
        provide: SB_CLIENT_OPTIONS,
        ...options.clients,
      });
    }

    if (Array.isArray(options.providers)) {
      providers.push(...options.providers);
    }

    if (options.metadataTransformer) {
      providers.push(normalizeProvider(options.metadataTransformer));
    }

    return { module: ServiceBusModule, providers };
  }

  private attribusManager: NestAttribusManager;

  constructor(discoveryFactory: SbDiscoveryFactoryService,
              @Optional() errorHandler?: SbErrorHandler,
              @Optional() @Inject(SB_CLIENT_OPTIONS) clientOptions?: SbClientOptions[],
              @Optional() @Inject(SB_SERVER_OPTIONS) serverOptions?: SbServerOptions[],
              @Optional() @Inject(ATTRIBUS_METADATA_TRANSFORMER) metadataTransformer?: MetadataTransformer) {
    if (!Array.isArray(serverOptions) || serverOptions.length === 0) {
      throw new Error('You must define at least 1 server, did you use `ServiceBusModule.register()` ?');
    }

    this.attribusManager = new NestAttribusManager(discoveryFactory, serverOptions, clientOptions, metadataTransformer, errorHandler);
  }

  async onModuleInit(): Promise<void> {
    await this.attribusManager.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.attribusManager.close();
  }
}
