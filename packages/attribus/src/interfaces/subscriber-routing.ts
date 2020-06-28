import { OperatorFunction, Observable } from 'rxjs';
import { MessagingError } from '@azure/service-bus';

import { SbSubscriberMetadata } from '../metadata-framework';
import { SbChannelManager } from '../resource-manager';
import { SbErrorHandler } from '../error-handling';
import { SbContext } from '../sb-context';
import { SbSubscriberTypeMap } from './subscriber';
import { SbServerOptions } from './options';

export interface MessageHandler {
  (context: SbContext): Promise<any> | Observable<any>;
}

export interface RouteToCommit<T extends 'method' | 'pipe' = 'method' | 'pipe', TSub extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> {
  key: string | symbol;
  subscriber: SbSubscriberMetadata<TSub>;
  instance: any;
  handler: T extends 'method' ? MessageHandler : OperatorFunction<SbContext, SbContext>;
}

export interface SbSubscriberRoutingContextFactory {
  createRouteContext(): SbSubscriberRoutingContext;
}

export interface SbSubscriberRoutingContext {
  options: SbServerOptions;
  channelManager: SbChannelManager;
  errorHandler: SbErrorHandler;
}
