import { of, isObservable, OperatorFunction, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { ServiceBusReceiver, ServiceBusSessionReceiver, ServiceBusReceivedMessage } from '@azure/service-bus';
import { MessageHandler } from '@nestjs/microservices';

import { SbSubscriberRoutingContext, SbSubscriberTypeMap, RouteToCommit } from '../interfaces';
import { SbSubscriberMetadata } from '../metadata';
import { SbErrorEvent, SbMessageErrorEvent } from '../error-handling';
import { SbContext } from '../sb-context';
import { SbConfigurator } from '../management';
import { createConsumer } from '../interceptors';
import { registerMessageHandler } from './register-message-handler';

class WrappedError extends Error {
  static wrapPromise(error: Error) { throw new WrappedError(error); }

  get name(): string { return this.error.name; }
  set name(value: string) { this.error.name = value; }

  get message(): string { return this.error.message; }
  set message(value: string) { this.error.message = value; }

  get stack(): string { return this.error.stack; }
  set stack(value: string) { this.error.stack = value; }

  constructor(public readonly error: Error) { super(); }
}

export abstract class SbSubscriberRouteHandler<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> {

  constructor(public readonly type: T) { }

  async verifyAndCreate<R extends 'pipe' | 'method'>(routeInstructions: RouteToCommit<R, T>,
                                                     context: SbSubscriberRoutingContext,
                                                     configurator?: SbConfigurator): Promise<void> {
    const options = routeInstructions.subscriber.metaOptions as SbSubscriberTypeMap[T];
    const { handler } = routeInstructions;

    if (configurator && !!options.provision) {
      try {
        await this.verify(options, configurator);
      } catch (error) {
        await context.errorHandler.onError(new SbErrorEvent('verify', options, error))
      }
    }

    const receiver = this.createReceiver(context, options);
    const messageHandler = routeInstructions.type === 'method'
      ? this.createMethodHandler(routeInstructions.subscriber, handler as MessageHandler, receiver)
      : this.createPipeHandler(routeInstructions.subscriber, handler as OperatorFunction<SbContext, SbContext>, routeInstructions, receiver)
    ;
    
    try {
      await registerMessageHandler(
          receiver,
          messageHandler,
        async (errorArgs) => {
          if (errorArgs.error instanceof WrappedError) {
            context.errorHandler.onMessageError(new SbMessageErrorEvent(options, errorArgs.error));
          } else {
            context.errorHandler.onError(new SbErrorEvent('listening', options, errorArgs.error));
          }
        },
        options.subscribeOptions
      );
    } catch (error) {
      await context.errorHandler.onError(new SbErrorEvent('register', options, error));
    }
  }

  protected abstract async verify(options: SbSubscriberTypeMap[T], configurator: SbConfigurator): Promise<any>;
  protected abstract createReceiver(context: SbSubscriberRoutingContext, options: SbSubscriberTypeMap[T]): ServiceBusReceiver | ServiceBusSessionReceiver;

  private createMethodHandler(metadata: SbSubscriberMetadata<T>, handler: MessageHandler<any, SbContext, any>, receiver: ServiceBusReceiver | ServiceBusSessionReceiver) {
    return async (message: ServiceBusReceivedMessage) => {
      await handler(message.body, new SbContext([metadata, message], receiver)).then(safeResolveResult).catch(WrappedError.wrapPromise);
    };
  }

  private createPipeHandler(metadata: SbSubscriberMetadata<T>, handler: OperatorFunction<SbContext, SbContext>, routeInstructions: RouteToCommit, receiver: ServiceBusReceiver | ServiceBusSessionReceiver) {
    const consumer = createConsumer(routeInstructions);

    return async (message: ServiceBusReceivedMessage) => {
      const context = new SbContext([metadata, message], receiver);
      const done = async () => handler(of(context)).pipe(mapTo(context)).toPromise();
      await consumer.intercept(context, done).then(safeResolveResult).catch(WrappedError.wrapPromise);
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
