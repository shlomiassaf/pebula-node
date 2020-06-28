import * as errors from '../errors';
import { sbResourceManager } from '../resource-manager';
import { SbServerOptions, AttribusConfiguration } from '../interfaces';
import { SbSubscriberMetadata, MetadataTarget } from '../metadata-framework';

export class SbServerDiscoveryService {

  private readonly serverOptions: SbServerOptions[];

  constructor(private readonly configuration: AttribusConfiguration) {
    this.serverOptions = this.configuration.servers;
  }

  create() {
    for (const options of this.serverOptions) {
      sbResourceManager.createServer(options, this.configuration.errorHandler);
    }
  }

  async parseTarget(instance: any, metadata: MetadataTarget) {
    const promises: Array<Promise<any>> = [];

    for (const [key, sub] of metadata.getSubscriptions()) {
      promises.push(this.initSubscriber(instance, key, sub));
    }

    return Promise.all(promises);
  }

  async commitRoutes() {
    for (const options of this.serverOptions) {
      await sbResourceManager.getServer(options.name).commitRoutes();
    }
  }

  async destroy() {
    for (const options of this.serverOptions) {
      await sbResourceManager.destroy(options.name);
    }
  }

  private async initSubscriber(instance: any, key: string | symbol, metadata: SbSubscriberMetadata): Promise<void> {
    if (!metadata.ready) {
      await metadata.init();
    }

    const { metaOptions } = metadata;

    const server = sbResourceManager.getServer(metaOptions.serverId);
    if (!server) {
      throw errors.missingSubscriberResource(metadata);
    }
    server.registerRoute(key, metadata, instance);
  }
}
