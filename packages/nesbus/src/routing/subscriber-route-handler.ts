import { of, isObservable, OperatorFunction, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { ServiceBusMessage, Receiver, SessionReceiver } from '@azure/service-bus';
import { MessageHandler } from '@nestjs/microservices';

import { SbSubscriberRoutingContext, SbSubscriberTypeMap, RouteToCommit } from '../interfaces';
import { SbSubscriberMetadata } from '../metadata';
import { SbContext } from '../sb-context';
import { SbConfigurator } from '../management';
import { createConsumer } from '../interceptors';
import { registerMessageHandler } from './register-message-handler';

export abstract class SbSubscriberRouteHandler<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> {

  constructor(public readonly type: T) { }

  async verifyAndCreate<R extends 'pipe' | 'method'>(routeInstructions: RouteToCommit<R, T>,
                                                     context: SbSubscriberRoutingContext,
                                                     configurator?: SbConfigurator): Promise<void> {
    const options = routeInstructions.subscriber.metaOptions as SbSubscriberTypeMap[T];
    const { handler } = routeInstructions;

    if (configurator && !!options.provision) {
      await this.verify(options, configurator);
    }

    const messageHandler = routeInstructions.type === 'method'
      ? this.createMethodHandler(routeInstructions.subscriber, handler as MessageHandler)
      : this.createPipeHandler(routeInstructions.subscriber, handler as OperatorFunction<SbContext, SbContext>, routeInstructions)
    ;

    await registerMessageHandler(this.createReceiver(context, options), messageHandler, context.onError, options.handlerOptions)
  }

  protected abstract async verify(options: SbSubscriberTypeMap[T], configurator: SbConfigurator): Promise<any>;
  protected abstract createReceiver(context: SbSubscriberRoutingContext, options: SbSubscriberTypeMap[T]): Receiver | SessionReceiver;

  private createMethodHandler(metadata: SbSubscriberMetadata<T>, handler: MessageHandler<any, SbContext, any>) {
    return async (message: ServiceBusMessage) => {
      await handler(message.body, new SbContext([metadata, message])).then(safeResolveResult);
    };
  }

  private createPipeHandler(metadata: SbSubscriberMetadata<T>, handler: OperatorFunction<SbContext, SbContext>, routeInstructions: RouteToCommit) {
    const consumer = createConsumer(routeInstructions);

    return async (message: ServiceBusMessage) => {
      const context = new SbContext([metadata, message]);
      const done = async () => handler(of(context)).pipe(mapTo(context)).toPromise();
      await consumer.intercept(context, done).then(safeResolveResult);
    };
  }
}

async function safeResolveResult(result: Observable<any> | Promise<any> | any) {
  if (isObservable(result)) {
    await result.toPromise();
  } else if (result && typeof (result as Promise<any>).then === 'function') {
    await result;
  } else {
    await Promise.resolve(result);
  }
}
