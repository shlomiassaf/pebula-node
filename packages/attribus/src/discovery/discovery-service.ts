import { SbServerOptions, SbClientOptions, AttribusConfiguration } from '../interfaces';
import { SbClientDiscoveryService } from './client-discovery-service';
import { SbServerDiscoveryService } from './server-discovery-service';
import { globalMetadataStore, MetadataTarget } from '../metadata-framework';
import { Ctor, getBaseClass } from '../utils';

export class SbDiscoveryService {

  private server: SbServerDiscoveryService;
  private client: SbClientDiscoveryService;

  constructor(public readonly configuration: AttribusConfiguration) { }

  init(): void {
    if (!Array.isArray(this.configuration.servers) || this.configuration.servers.length === 0) {
      throw new Error('You must define at least 1 server.');
    }
  
    this.server = new SbServerDiscoveryService(this.configuration);
    this.client = new SbClientDiscoveryService(this.configuration);

    this.server.create();
    this.client.create();
  }

  async discover(): Promise<void> {
    // We build the server and client
    // For server, we only store routes, without registering them
    // For client we register.
    //
    // Registering means provision, if set (verify, create) and commit.
    //
    // Commit:
    // For server, commit means connecting to service bus to start listening for messages
    // For client it means creating the Sender, which is lazy so no connection is done.
    //
    // This is why we register and commit clients right away
    await this.build();

    // We commit the routes in the client, at this point all client passed provision.
    // In the process we prioritize the routes so all subscriptions with topic provision will run first
    // in order to avoid a missing topic when registering a subscription.
    await this.server.commitRoutes();
  }

  async destroy() {
    await this.client.destroy();
    await this.server.destroy();
  }

  protected async build() {
    const { containers } = this.configuration;

    if (!Array.isArray(containers) || containers.length === 0) {
      throw new Error('You must define at least 1 instance container.');
    }

    for (const instance of containers) {
      const metadata = this.tryGetTargetMetadata(instance.constructor);
      if (!metadata) {
        throw new Error('Invalid container');
      }
      await this.server.parseTarget(instance, metadata);
      await this.client.parseTarget(instance, metadata);
    }
  }

  protected tryGetTargetMetadata(ctor: Ctor<any>): MetadataTarget {
    while (ctor) {
      const metadata = globalMetadataStore.get(ctor);
      if (metadata) {
        return metadata;
      }
      ctor = getBaseClass(ctor) as any;
    }
  }

}
