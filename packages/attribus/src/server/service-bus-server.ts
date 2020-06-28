import { isFunction } from 'util';
import { ServiceBusClient } from '@azure/service-bus';
import { SbServerOptions, SbSubscriberRoutingContext, SbSubscriberRoutingContextFactory, SbSubscriberTypeMap, RouteToCommit } from '../interfaces';
import { SbSubscriberMetadata } from '../metadata-framework';
import { SbSubscriberRouter } from '../routing';
import { SbConfigurator } from '../management';
import { SbChannelManager } from '../resource-manager';
import { SbLogger, NoopLogger } from '../utils';
import * as errors from '../errors';
import { SbErrorHandler } from '../error-handling';

export class SbServer {

  public readonly id?: string;

  sbLogger: SbLogger = NoopLogger.shared;
  protected router: SbSubscriberRouter;
  
  private routeContext: SbSubscriberRoutingContext;
  private routesToCommit: Record<keyof SbSubscriberTypeMap, RouteToCommit[]> = { queue: [], subscription: [] };

  constructor(private readonly options: SbServerOptions,
              private readonly channelManager: SbChannelManager,
              public readonly client: ServiceBusClient,
              public readonly errorHandler: SbErrorHandler,
              public readonly configurator?: SbConfigurator) {
    this.id = options.name;
    this.sbLogger = options.logger || NoopLogger.shared;

    this.routeContext = {
      options,
      channelManager,
      get errorHandler() { return errorHandler; },
     };
    this.router = new SbSubscriberRouter(this, this.configurator);
  }

  createRouteContext(): SbSubscriberRoutingContext {
    return this.routeContext;
  }

  registerRoute(key: string | symbol, subscriber: SbSubscriberMetadata, instance: any) {
    const handler = subscriber.handlerType === 'method' ? subscriber.descriptor.value : instance[key];
    if (!isFunction(handler)) {
      throw errors.invalidSubscriberDecoration(key, subscriber);
    }
    this.appendRoute({ key, subscriber, instance, handler });
  }

  async commitRoutes() {
    const { router } = this;
    const promises: Array<Promise<void>> = [];

    const executeRoute = (route: RouteToCommit) => router
      .createRouterHandler(route)
      .then( () => this.logRoute(route.subscriber) );

    const { queue, subscription } = this.routesToCommit;
    this.routesToCommit = undefined;

    if (this.options.registerHandlers === 'sequence') {
      for (const q of queue) {
        await executeRoute(q);
      }
      for (const s of subscription) {
        await executeRoute(s);
      }
    } else {
      for (const q of queue) {
        promises.push(executeRoute(q));
      }
  
      for (const s of subscription) {
        promises.push(executeRoute(s));
      }
  
      await Promise.all(promises);
    }
  }

  async destroy() {
  }

  /**
   * Store routing instruction for commit in a later phase of the initialization of the server.
   * Some logic is applied on the order that the server will commit all routes, the order of appending routes is
   * not guaranteed to be the order they register.
   *
   * For example, a subscription with a topic provision of `verifyCreate` will be bumped to the top of the list so it
   * can run before all other subscriptions which might depend on that topic but do not provision it's creation.
   */
  private appendRoute(routeInstructions: RouteToCommit) {
    const collection = this.routesToCommit[routeInstructions.subscriber.type];

    if (this.configurator
        && routeInstructions.subscriber.type === 'subscription'
        && this.configurator.subscriptionHasDependency(routeInstructions.subscriber.metaOptions.provision)) {
      collection.unshift(routeInstructions);
    } else {
      collection.push(routeInstructions);
    }
  }

  private logRoute(subscriber: SbSubscriberMetadata) {
    this.sbLogger.log(`Registered subscriber ${subscriber.handlerType} [${subscriber.type}]: ${subscriber.metaOptions.name}`);
  }
}
