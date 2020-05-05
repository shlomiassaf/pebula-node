import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import * as errors from '../errors';
import { SbDiscoveryMetadataExplorer } from './metadata-explorer';
import { sbResourceManager } from '../resource-manager';
import { EmitterMetadataForTarget } from '../decorators';
import { SbClientOptions } from '../interfaces';

export class SbClientDiscoveryService {

  constructor(private readonly clientOptions: SbClientOptions[],
              private readonly metadataHelper?: any) { }

  create() {
    for (const options of this.clientOptions) {
      sbResourceManager.createClient(options);
    }
  }

  async destroy() {
    for (const options of this.clientOptions) {
      await sbResourceManager.destroy(options.name);
    }
  }

  async parseProvider(instanceWrapper: InstanceWrapper<any>, explorer: SbDiscoveryMetadataExplorer) {
    const promises: Array<Promise<any>> = [];

    if (!instanceWrapper.isNotMetatype) {
      for (const emitter of explorer.scanForEmitterHooks(instanceWrapper.instance)) {
        promises.push(this.initEmitter(emitter, instanceWrapper));
      }
    }

    return Promise.all(promises);
  }

  private async initEmitter(emitter: EmitterMetadataForTarget[0],
                            instanceWrapper: InstanceWrapper<any>): Promise<void> {
    const { key, metadata } = emitter;
    if (!metadata.ready) {
      await metadata.init(this.metadataHelper);
    }
    const { metaOptions } = metadata;

    const client = sbResourceManager.getClient(metaOptions.clientId);
    if (!client) {
      throw errors.missingEmitterResource(metadata);
    }

    const sender = await client.createEmitter(metadata);
    this.assignEmitterToInstance(instanceWrapper.instance, key, sender);
  }

  private assignEmitterToInstance<T = any>(instance: any, property: string | symbol, client: T) {
    Reflect.set(instance, property, client);
  }
}
