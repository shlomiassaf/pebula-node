import { SbSubscriberRouteHandler } from '../subscriber-route-handler';
import { SbQueueMetadataOptions, SbSubscriberRoutingContext } from '../../interfaces';
import { SbConfigurator } from '../../management';

export class QueueRouteHandler extends SbSubscriberRouteHandler<'queue'> {

  constructor() { super('queue'); }

  async verify(options: SbQueueMetadataOptions, configurator: SbConfigurator): Promise<any> {
    return configurator.verifyQueue(options.name, options.provision);
  }

  protected createReceiver(context: SbSubscriberRoutingContext, options: SbQueueMetadataOptions) {
    const { name, receiveMode, sessionOptions } = options;
    return context.channelManager.getCreateQueryReceiver(name, receiveMode, sessionOptions);
  }
}
