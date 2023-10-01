import { ServiceBusSessionReceiverOptions, ServiceBusReceiverOptions, SubscribeOptions } from '@azure/service-bus';
import { SbEntityProvisionOption, SbQueueEntityProvision, SbTopicSubscriptionEntityProvision } from './entity-provision';

export interface SbSubscriberMetadataOptions {
  name: string;
  receiveMode: 'peekLock' | 'receiveAndDelete';
  handlerOptions?: ServiceBusReceiverOptions;
  sessionOptions?: ServiceBusSessionReceiverOptions;
  subscribeOptions?: SubscribeOptions;

  /**
   * The unique id of the server that this emitter should use as the underlying listener.
   * This should match the server name defined in `SgServerOptions.name`.
   *
   * By default `SgServerOptions.name` is not set, which is the identifier for the default server.
   * A multi-server environment is not required in most of the scenarios, if that is the case do not set this value.
   */
  serverId?: string;
}

export interface SbQueueMetadataOptions extends SbSubscriberMetadataOptions {
  provision?: SbEntityProvisionOption<SbQueueEntityProvision>;
}

export interface SbSubscriptionMetadataOptions extends SbSubscriberMetadataOptions {
  topicName: string;
  provision?: SbEntityProvisionOption<SbTopicSubscriptionEntityProvision>;
  // filter etc...
}

export interface SbSubscriberTypeMap {
  queue: SbQueueMetadataOptions;
  subscription: SbSubscriptionMetadataOptions;
}
