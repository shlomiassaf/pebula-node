import * as errors from '../errors';
import { sbResourceManager } from '../resource-manager';
import { SbClientOptions, AttribusConfiguration } from '../interfaces';
import { SbEmitterMetadata, MetadataTarget } from '../metadata-framework';

export class SbClientDiscoveryService {

  private readonly clientOptions: SbClientOptions[];

  constructor(private readonly configuration: AttribusConfiguration) {
    this.clientOptions = Array.isArray(this.configuration.clients) ? this.configuration.clients : [];
    if (this.clientOptions.length === 0) {
      this.clientOptions.push({});
    }
  }

  create() {
    for (const options of this.clientOptions) {
      sbResourceManager.createClient(options, this.configuration.errorHandler);
    }
  }

  async destroy() {
    for (const options of this.clientOptions) {
      await sbResourceManager.destroy(options.name);
    }
  }

  async parseTarget(instance: any, metadata: MetadataTarget) {
    const promises: Array<Promise<any>> = [];

    for (const [key, emitter] of metadata.getEmitters()) {
      promises.push(this.initEmitter(instance, key, emitter));
    }

    return Promise.all(promises);
  }

  private async initEmitter(instance: any, key: string | symbol, emitter: SbEmitterMetadata): Promise<void> {
    if (!emitter.ready) {
      await emitter.init();
    }
    const { metaOptions } = emitter;

    const client = sbResourceManager.getClient(metaOptions.clientId);
    if (!client) {
      throw errors.missingEmitterResource(emitter);
    }

    const sender = await client.createEmitter(emitter);
    this.assignEmitterToInstance(instance, key, sender);
  }

  private assignEmitterToInstance<T = any>(instance: any, property: string | symbol, client: T) {
    Reflect.set(instance, property, client);
  }
}
