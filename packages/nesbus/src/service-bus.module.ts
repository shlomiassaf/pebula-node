import { Module, OnModuleInit, Optional, Inject, DynamicModule, Provider, Type, OnModuleDestroy } from '@nestjs/common';
import { SB_CLIENT_OPTIONS, SB_SERVER_OPTIONS, SB_META_HELPER_FACTORY_TOKEN } from './constants';
import { SbServerOptions, SbModuleRegisterOptions, SbClientOptions } from './interfaces';
import { SbDiscoveryFactoryService, SbDiscoveryService } from './discovery';

function normalizeProvider(provider: Omit<Exclude<Provider, Type<any>>, 'provide'> | Type<any>): Provider {
  if (typeof provider === 'function') {
    provider = { useClass: provider };
  }
  return {
    ...(provider as Exclude<Provider, Type<any>>),
    provide: SB_META_HELPER_FACTORY_TOKEN,
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

    if (options.metaFactoryProvider) {
      providers.push(normalizeProvider(options.metaFactoryProvider));
    }

    if (Array.isArray(options.providers)) {
      providers.push(...options.providers);
    }

    return { module: ServiceBusModule, providers };
  }

  private discovery: SbDiscoveryService;

  constructor(discoveryFactory: SbDiscoveryFactoryService,
              @Optional() @Inject(SB_META_HELPER_FACTORY_TOKEN) metadataHelper?: any,
              @Optional() @Inject(SB_CLIENT_OPTIONS) clientOptions?: SbClientOptions[],
              @Optional() @Inject(SB_SERVER_OPTIONS) serverOptions?: SbServerOptions[]) {
    if (!Array.isArray(serverOptions) || serverOptions.length === 0) {
      throw new Error('You must define at least 1 server, did you use `ServiceBusModule.register()` ?');
    }

    this.discovery = discoveryFactory.create(
      serverOptions,
      !Array.isArray(clientOptions) || clientOptions.length === 0 ? [{}] : clientOptions,
      metadataHelper,
    );

    this.discovery.init();
  }

  async onModuleInit(): Promise<void> {
    await this.discovery.discover();
  }

  async onModuleDestroy(): Promise<void> {
    await this.discovery.destroy();
  }
}
