import { isFunction } from 'util';
import { MessageHandler } from '@nestjs/microservices';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import * as errors from '../errors';
import { SbDiscoveryMetadataExplorer } from './metadata-explorer';
import { sbResourceManager } from '../resource-manager';
import { SubscriberMetadataForTarget } from '../decorators';
import { SbServerOptions } from '../interfaces';
import { SbSubscriberMetadata } from '../metadata';

export class SbServerDiscoveryService {

  private legacyHandlers: Map<SbSubscriberMetadata, MessageHandler>;

  constructor(private readonly serverOptions: SbServerOptions[],
              private readonly metadataHelper?: any,) {  }

  create() {
    for (const options of this.serverOptions) {
      // servers are different from clients, they might already be created due to how microservices work in nestjs.
      if (!sbResourceManager.getServer(options.name)) {
        sbResourceManager.createServer(options.name);
      }
      sbResourceManager.registerServer(options);
    }
  }

  detectLegacyHandlers(): void {
    this.legacyHandlers = sbResourceManager.flushLegacyHandler();
  }

  async parseProvider(instanceWrapper: InstanceWrapper<any>, explorer: SbDiscoveryMetadataExplorer) {
    const promises: Array<Promise<any>> = [];

    if (!instanceWrapper.isNotMetatype) {
      for (const subscriber of explorer.scanForSubscriberHooks(instanceWrapper.instance)) {
        promises.push(this.initSubscriber(subscriber, instanceWrapper));
      }
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

  private async initSubscriber(subscriber: SubscriberMetadataForTarget[0],
                               instanceWrapper: InstanceWrapper<any>): Promise<void> {

    const { key, metadata } = subscriber;

    if (!metadata.ready) {
      await metadata.init(this.metadataHelper);
    }

    const { metaOptions } = metadata;

    const server = sbResourceManager.getServer(metaOptions.serverId);
    if (!server) {
      throw errors.missingSubscriberResource(metadata);
    }

    const legacyMessageHandler = this.legacyHandlers.get(metadata);
    if (legacyMessageHandler) {
      this.legacyHandlers.delete(metadata);
      server.registerRoute('method', key, metadata, instanceWrapper, legacyMessageHandler);
    } else {
      const handler = instanceWrapper.instance[key];
      if (!isFunction(handler)) {
        throw errors.invalidSubscriberDecoration(key, metadata);
      }
      server.registerRoute('pipe', key, metadata, instanceWrapper, handler);
    }
  }
}
