import { SendableMessageInfo } from '@azure/service-bus';
import { SbEntityProvisionOption, SbQueueEntityProvision, SbTopicEntityProvision } from './entity-provision';

export interface SbEmitterMetadataOptions {
  name: string;

  /**
   * The unique id of the client that this emitter should use as the underlying emitter.
   * This should match the client name defined in `SgClientOptions.name`.
   *
   * By default `SgClientOptions.name` is not set, which is the identifier for the default client.
   * A multi-client environment is not required in most of the scenarios, if that is the case do not set this value.
   */
  clientId?: string;
}

export interface SbQueueEmitterMetadataOptions extends SbEmitterMetadataOptions {
  provision?: SbEntityProvisionOption<SbQueueEntityProvision>;
}

export interface SbTopicMetadataOptions extends SbEmitterMetadataOptions {
  provision?: SbEntityProvisionOption<SbTopicEntityProvision>;
}

export interface SbEmitterTypeMap {
  queue: SbQueueEmitterMetadataOptions;
  topic: SbTopicMetadataOptions;
}

/**
 * A Reference to an existing client emitter.
 * This is basically a query to get the service bus `Sender` instance for the client registered at the
 * queue / topic name.
 *
 * Note that if you're using unique client name you can also provide the specific client id to target.
 *
 * Type (topic/queue) is irrelevant because in any case two identical entities can not share the same name
 * event if they are of different type.
 */
export type SbEmitterRef = SbEmitterMetadataOptions;

/**
 * Represents an object that can emit service bus message. (I.E a service bus `Sender`)
 */
export interface SbEmitterImp {
  send(message: SendableMessageInfo): Promise<void>;
}

/**
 * Represents an object that can be used (directly or indirectly) to emit messages to service bus.
 * This can be either a directly emitting object or a reference that is used to resolve a directly emitting object.
 */
export type SbMessageEmitter = SbEmitterRef | SbEmitterImp;
