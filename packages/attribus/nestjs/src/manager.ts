import { AttribusManagerBase, AttribusConfiguration, SbServerOptions, SbClientOptions, SbErrorHandler } from '@pebula/attribus';
import { SbDiscoveryFactoryService } from './discovery';
import { MetadataTransformer } from './interfaces';

export class NestAttribusManager extends AttribusManagerBase {
  constructor(private discoveryFactory: SbDiscoveryFactoryService,
              private servers: SbServerOptions[],
              private clients?: SbClientOptions[],
              private metadataTransformer?: MetadataTransformer,
              private errorHandler?: SbErrorHandler) {
    super();
  }

  protected async getConfiguration(): Promise<AttribusConfiguration> {
    return {
      containers: [],
      servers: this.servers,
      clients: this.clients,
      errorHandler: this.errorHandler,
    }
  }

  protected async createDiscoveryService(configuration: AttribusConfiguration) {
    return this.discoveryFactory.create(configuration, this.metadataTransformer);
  }

}
