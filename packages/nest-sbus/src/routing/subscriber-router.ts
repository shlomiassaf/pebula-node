import * as errors from '../errors';
import { SbSubscriberRoutingContextFactory, SbSubscriberTypeMap, RouteToCommit } from '../interfaces';
import { SbConfigurator } from '../management';
import * as handlers from './handlers';
import { SbSubscriberRouteHandler } from './subscriber-route-handler';

export class SbSubscriberRouter {

  private readonly handlers = new Map<keyof SbSubscriberTypeMap, SbSubscriberRouteHandler<any>>();

  constructor(private readonly contextFactory: SbSubscriberRoutingContextFactory,
              private readonly configurator?: SbConfigurator) {
    // We register here on the fly, probably need to use the public API to declare this outside
    this.registerRouteHandler(new handlers.QueueRouteHandler());
    this.registerRouteHandler(new handlers.SubscriptionRouteHandler());
  }

  async createRouterHandler<T extends 'pipe' | 'method'>(routeInstructions: RouteToCommit<T>): Promise<void> {
    const routeHandler = this.handlers.get(routeInstructions.subscriber.type);

    if (routeHandler) {
      await routeHandler.verifyAndCreate(routeInstructions, this.contextFactory.createRouteContext(), this.configurator);
    } else {
      throw errors.routeHandlerMissing(routeInstructions.subscriber);
    }
  }

  registerRouteHandler<T extends keyof SbSubscriberTypeMap>(routeHandler: SbSubscriberRouteHandler<T>): void {
    this.handlers.set(routeHandler.type, routeHandler);
  }
}
