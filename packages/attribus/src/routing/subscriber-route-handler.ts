import { of, isObservable, OperatorFunction, Observable } from 'rxjs';
import { mapTo } from 'rxjs/operators';
import { ServiceBusMessage, Receiver, SessionReceiver, MessagingError, ReceiveMode } from '@azure/service-bus';

import { SbSubscriberRoutingContext, SbSubscriberTypeMap, RouteToCommit, MessageHandler } from '../interfaces';
import { SbErrorEvent, SbMessageErrorEvent } from '../error-handling';
import { SbContext } from '../sb-context';
import { SbConfigurator } from '../management';
import { createConsumer } from '../interceptors';
import { registerMessageHandler } from './register-message-handler';

class WrappedError extends Error {
  static wrapPromise(message: ServiceBusMessage) {
    return (error: Error) => { throw new WrappedError(error, message); };
  }

  get name(): string { return this.error.name; }
  set name(value: string) { this.error.name = value; }

  get message(): string { return this.error.message; }
  set message(value: string) { this.error.message = value; }

  get stack(): string { return this.error.stack; }
  set stack(value: string) { this.error.stack = value; }

  constructor(public readonly error: Error, public readonly serviceBusMessage: ServiceBusMessage) { super(); }
}

export abstract class SbSubscriberRouteHandler<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> {

  constructor(public readonly type: T) { }

  async verifyAndCreate<R extends 'pipe' | 'method'>(routeInstructions: RouteToCommit<R, T>,
                                                     context: SbSubscriberRoutingContext,
                                                     configurator?: SbConfigurator): Promise<void> {
    const options = routeInstructions.subscriber.metaOptions as SbSubscriberTypeMap[T];
    
    if (!(await this.swallowErrorsConfigValid(context, options))) {
      return;
    }

    if (configurator && !!options.provision) {
      try {
        await this.verify(options, configurator);
      } catch (error) {
        await context.errorHandler.onError(new SbErrorEvent('verify', options, error))
        return;
      }
    }
    
    const messageHandler = routeInstructions.subscriber.handlerType === 'method'
      ? this.createMethodHandler(routeInstructions, context)
      : this.createPipeHandler(routeInstructions, context)
    ;

    const swallowingErrorsHandler = async (message: ServiceBusMessage) => {
      try {
        await messageHandler(message);
      } catch (error) {
        if (error instanceof WrappedError) {
          await context.errorHandler.onMessageError(new SbMessageErrorEvent(options, error.error, error.serviceBusMessage));
        } else {
          await context.errorHandler.onError(new SbErrorEvent('listening', options, error));
        }
      }
    };

    try {
      await registerMessageHandler(
        this.createReceiver(context, options),
        options.swallowErrors ? swallowingErrorsHandler : messageHandler,
        error => {
          if (error instanceof WrappedError) {
            context.errorHandler.onMessageError(new SbMessageErrorEvent(options, error.error, error.serviceBusMessage));
          } else {
            context.errorHandler.onError(new SbErrorEvent('listening', options, error));
          }
        },
        options.handlerOptions
      );
    } catch (error) {
      await context.errorHandler.onError(new SbErrorEvent('register', options, error));
    }
  }

  protected abstract async verify(options: SbSubscriberTypeMap[T], configurator: SbConfigurator): Promise<any>;
  protected abstract createReceiver(context: SbSubscriberRoutingContext, options: SbSubscriberTypeMap[T]): Receiver | SessionReceiver;

  private createMethodHandler(routeInstructions: RouteToCommit, context: SbSubscriberRoutingContext) {
    const handler = routeInstructions.handler as MessageHandler;

    return async (message: ServiceBusMessage) => {
      const result = handler.call(routeInstructions.instance, new SbContext(routeInstructions.subscriber, message, context.options.logger));
      await safeResolveResult(result).catch(WrappedError.wrapPromise(message));
    };
  }

  private createPipeHandler(routeInstructions: RouteToCommit, context: SbSubscriberRoutingContext) {
    const handler = routeInstructions.handler as OperatorFunction<SbContext, SbContext>;
    const consumer = createConsumer(routeInstructions);

    return async (message: ServiceBusMessage) => {
      const ctx = new SbContext(routeInstructions.subscriber, message, context.options.logger);
      const done = async () => handler.call(routeInstructions.instance, of(ctx)).pipe(mapTo(ctx)).toPromise();
      await consumer.intercept(ctx, done).then(safeResolveResult).catch(WrappedError.wrapPromise(message));
    };
  }

  private async swallowErrorsConfigValid(context: SbSubscriberRoutingContext, options: SbSubscriberTypeMap[T]): Promise<boolean> {
    if (options.swallowErrors) {
      if (options.swallowErrors === true) {
        if (options.receiveMode === ReceiveMode.peekLock && (!options.handlerOptions || options.handlerOptions.autoComplete !== false)) {
          await context.errorHandler.onError(new SbErrorEvent('verify', options, new Error(`Swallowing error is not allowed when "autoComplete" is enabled in "peekLock" mode.`)));
          return false;
        }
      } else if (options.swallowErrors !== 'swallowAndAutoComplete') {
        await context.errorHandler.onError(new SbErrorEvent('verify', options, new Error(`Invalid value "${options.swallowErrors}" in "swallowErrors".`)));
        return false;
      }
    }
    return true;
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
