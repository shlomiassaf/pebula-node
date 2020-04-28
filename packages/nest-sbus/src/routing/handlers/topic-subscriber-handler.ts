import { SbSubscriberRouteHandler } from '../subscriber-route-handler';
import { SbSubscriberRoutingContext, SbSubscriptionMetadataOptions } from '../../interfaces';
import { SbConfigurator } from '../../management';

export class SubscriptionRouteHandler extends SbSubscriberRouteHandler<'subscription'> {

  constructor() { super('subscription'); }

  async verify(options: SbSubscriptionMetadataOptions, configurator: SbConfigurator): Promise<any> {
    return configurator.verifySubscription(options.topicName, options.name, options.provision);
  }

  protected createReceiver(context: SbSubscriberRoutingContext, options: SbSubscriptionMetadataOptions) {
    const { topicName, name, receiveMode, sessionOptions } = options;
    return context.channelManager.getCreateSubscription(topicName, name, receiveMode, sessionOptions);
  }

}
