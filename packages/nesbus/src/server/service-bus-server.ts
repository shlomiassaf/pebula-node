import { OperatorFunction } from 'rxjs';
import { ServiceBusClient } from '@azure/service-bus';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { LoggerService } from '@nestjs/common';
import { Server, CustomTransportStrategy, MessageHandler } from '@nestjs/microservices';
import { SbServerOptions, SbSubscriberRoutingContext, SbSubscriberRoutingContextFactory, SbSubscriberTypeMap, RouteToCommit } from '../interfaces';
import { SbSubscriberMetadata } from '../metadata';
import { SbSubscriberRouter } from '../routing';
import { SbConfigurator } from '../management';
import { sbResourceManager, SbChannelManager } from '../resource-manager';
import { SbContext } from '../sb-context';
import { NoopLogger } from '../noop-logger';

const noopLogger = new NoopLogger();

export class SbServer extends Server implements CustomTransportStrategy, SbSubscriberRoutingContextFactory {
  public client: ServiceBusClient;
  public configurator?: SbConfigurator;

  get initialized(): boolean { return !!this.isInit; }

  protected sbLogger: LoggerService = noopLogger;
  protected router: SbSubscriberRouter;
  private routeContext: SbSubscriberRoutingContext;
  private readonly isInit: boolean;
  private routesToCommit: Record<keyof SbSubscriberTypeMap, RouteToCommit[]> = { queue: [], subscription: [] };

  constructor(public readonly id?: string) {
    super();
    Object.defineProperty(this, 'logger', { get: () => this.sbLogger });
  }

  init(options: SbServerOptions,
       channelManager: SbChannelManager,
       client: ServiceBusClient,
       configurator?: SbConfigurator) {
    if (this.isInit) {
      return;
    }

    if (options.logger) {
      this.sbLogger = options.logger;
    }

    Object.defineProperty(this, 'isInit', { value: true });
    this.client = client;
    this.configurator = configurator;

    this.router = new SbSubscriberRouter(this, this.configurator);

    this.routeContext = {
      channelManager,
      onError: error => this.logger.error(error.message, error.stack),
     };

    channelManager.resourceUpdate();
  }

  createRouteContext(): SbSubscriberRoutingContext {
    return this.routeContext;
  }

  addHandler(pattern: any, handler: MessageHandler) {
    if (SbSubscriberMetadata.is(pattern)) {
      sbResourceManager.addLegacyHandler(handler, pattern);
    }
  }

  registerRoute(type: 'pipe',
                key: string | symbol,
                subscriber: SbSubscriberMetadata,
                instanceWrapper: InstanceWrapper<any>,
                handler: OperatorFunction<SbContext, SbContext>);
  registerRoute(type: 'method',
                key: string | symbol,
                subscriber: SbSubscriberMetadata,
                instanceWrapper: InstanceWrapper<any>,
                handler: MessageHandler);
  registerRoute<T extends 'pipe' | 'method'>(type: T,
                                             key: string | symbol,
                                             subscriber: SbSubscriberMetadata,
                                             instanceWrapper: InstanceWrapper<any>,
                                             handler: RouteToCommit<T>['handler']) {
    if (type === 'method') {
      super.addHandler(subscriber.metaOptions.name, handler as MessageHandler, false);
    }
    this.appendRoute({ type, key, subscriber, instanceWrapper, handler });
  }

  async commitRoutes() {
    const { router } = this;
    const promises: Array<Promise<void>> = [];

    const executeRoute = (route: RouteToCommit) => router
      .createRouterHandler(route)
      .then( () => this.logRoute(route.subscriber, route.type) );

    const { queue, subscription } = this.routesToCommit;
    this.routesToCommit = undefined;

    for (const q of queue) {
      promises.push(executeRoute(q));
    }

    for (const s of subscription) {
      promises.push(executeRoute(s));
    }
  }

  async listen(callback: () => void) {
    callback();
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  /**
   * Store routing instruction for commit in a later phase of the initialization of the server.
   * Some logic is applied on the order that the server will commit all routes, the order of appending routes is
   * not guaranteed to be the order they register.
   *
   * For example, a subscription with a topic provision of `verifyCreate` will be bumped to the top of the list so it
   * can run before all other subscriptions which might depend on that topic but do not provision it's creation.
   */
  private appendRoute<T extends 'pipe' | 'method'>(routeInstructions: RouteToCommit<T>) {
    const collection = this.routesToCommit[routeInstructions.subscriber.type];

    if (this.configurator
        && routeInstructions.subscriber.type === 'subscription'
        && this.configurator.subscriptionHasDependency(routeInstructions.subscriber.metaOptions.provision)) {
      collection.unshift(routeInstructions);
    } else {
      collection.push(routeInstructions);
    }
  }

  private logRoute(subscriber: SbSubscriberMetadata, type: 'pipe' | 'method') {
    this.logger.log(`Registered subscriber ${type} [${subscriber.type}]: ${subscriber.metaOptions.name}`);
  }
}
