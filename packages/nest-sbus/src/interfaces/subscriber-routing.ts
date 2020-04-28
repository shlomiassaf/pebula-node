import { OperatorFunction } from 'rxjs';
import { MessagingError } from '@azure/service-bus';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { MessageHandler } from '@nestjs/microservices';

import { SbSubscriberMetadata } from '../metadata/subscriber-metadata';
import { SbChannelManager } from '../resource-manager';
import { SbContext } from '../sb-context';
import { SbSubscriberTypeMap } from './subscriber';

export interface RouteToCommit<T extends 'method' | 'pipe' = 'method' | 'pipe', TSub extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> {
  type: T;
  key: string | symbol;
  subscriber: SbSubscriberMetadata<TSub>;
  instanceWrapper: InstanceWrapper<any>;
  handler: T extends 'method' ? MessageHandler : OperatorFunction<SbContext, SbContext>;
}

export interface SbSubscriberRoutingContextFactory {
  createRouteContext(): SbSubscriberRoutingContext;
}

export interface SbSubscriberRoutingContext {
  channelManager: SbChannelManager;
  onError: (error: MessagingError | Error) => void;
}
