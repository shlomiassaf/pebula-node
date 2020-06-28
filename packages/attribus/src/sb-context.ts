import { ServiceBusMessage } from '@azure/service-bus';

import { SbSubscriberTypeMap, SbSubscriptionMetadataOptions, SbQueueSubscriptionMetadataOptions, SbEmitterRef, SbEmitterImp } from './interfaces';
import { sbResourceManager } from './resource-manager';
import { SbSubscriberMetadata } from './metadata-framework';
import { SbLogger, NoopLogger } from './utils';

export type SbContextArgs<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> = [SbSubscriberMetadata<T>, ServiceBusMessage];

export class SbContext<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> {
  public readonly logger: SbLogger

  get type(): T { return this.metadata.type; }

  get metadataOptions(): SbSubscriptionMetadataOptions | SbQueueSubscriptionMetadataOptions {
    // at this point, the metaOptions object is frozen.
    return this.metadata.metaOptions;
  }

  constructor(private readonly metadata: SbSubscriberMetadata<T>,
              private readonly message: ServiceBusMessage,
              logger: SbLogger) {
    this.logger = logger || NoopLogger.shared;
  }

  getData<TBody = any>(): TBody { return this.message.body; }

  getMessage(): ServiceBusMessage { return this.message; }

  /**
   * The entity name used to identify subscription/queue in service bus
   */
  entityName(): string {
    return this.metadata.metaOptions.name;
  }

  /**
   * Try to resolves a client (queue or topic emitter/sender) based on the entity name.
   *
   * If an entity reference is not provided, the default reference is the entity used to emit messages to this subscriber.
   * If this is a queue subscriber, it will be a queue emitter. If this is a subscription, it will be the topic of the subscription.
   *
   * > You can also provide a clientId to look the entity in.
   */
  resolveClient(emitterReference?: SbEmitterRef): SbEmitterImp | undefined {
    if (emitterReference) {
      return sbResourceManager.tryResolveEmitter(emitterReference);
    } else {
      const name = this.metadata.type === 'subscription'
        ? (this.metadata as SbSubscriberMetadata<'subscription'>).metaOptions.topicName
        : this.metadata.metaOptions.name
      ;
      return sbResourceManager.tryResolveEmitter({ name, clientId: this.metadata.metaOptions.serverId });
    }
  }
}
