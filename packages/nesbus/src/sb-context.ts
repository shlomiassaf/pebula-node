import { ServiceBusReceivedMessage, ServiceBusReceiver, ServiceBusSessionReceiver } from '@azure/service-bus';
import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';

import { SbEmitterRef, SbEmitterImp, SbSubscriberTypeMap } from './interfaces';
import { sbResourceManager } from './resource-manager';
import { SbSubscriberMetadata } from './metadata';

export type SbContextArgs<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> = [SbSubscriberMetadata<T>, ServiceBusReceivedMessage];

export class SbContext<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> extends BaseRpcContext<SbContextArgs<T>> {
  get type(): T { return this.metadata.type; }

  private message: ServiceBusReceivedMessage;
  private metadata: SbSubscriberMetadata<T>;
  private receiver: ServiceBusReceiver | ServiceBusSessionReceiver;

  constructor(args: SbContextArgs<T>, receiver: ServiceBusReceiver | ServiceBusSessionReceiver) {
    super(args);
    this.metadata = args[0];
    this.message = args[1];
    this.receiver = receiver;
  }

  getData<TBody = any>(): TBody { return this.message.body; }

  getMessage(): ServiceBusReceivedMessage { return this.message; }
  
  getReceiver(): ServiceBusReceiver | ServiceBusSessionReceiver { return this.receiver; }

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
