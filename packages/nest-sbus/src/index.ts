import './atom-adapter';
import { register } from './atom-adapter';

export { SbContext, SbContextArgs } from './sb-context';

export {
  SbModuleRegisterOptions,
  SbServerOptions,
  SbManagementClientOptions, SbManagementDefaultsAdapter,
  ServiceBusAadTokenCredentials,
  ServiceBusConnectionStringCredentials,
  ServiceBusTokenProviderCredentials,

  // Emitter Metadata
  SbEmitterMetadataOptions,
  SbQueueEmitterMetadataOptions,
  SbTopicMetadataOptions,
  SbEmitterRef, SbEmitterImp,

  // Subscriber Metadata
  SbSubscriberMetadataOptions,
  SbQueueMetadataOptions,
  SbSubscriptionMetadataOptions,

  SbInterceptor,

  SbEntityProvisionOption,
  SbQueueEntityProvision,
  SbTopicEntityProvision,
  SbTopicSubscriptionEntityProvision,
  SbRuleEntityProvision,

  MetaOrMetaFactory,
  SbMessageEmitter,
} from './interfaces';

export { SbManagementClientAtomOptions } from './atom-adapter';

export {
  SbQueue,
  SbTopic,
  SbSubscription,
  SbRule,
  SbCorrelationFilter,
  SbSqlFilter,
} from './models';

export {
  Queue, Subscription, SbIntercept,
  QueueEmitter, Topic,
} from './decorators';

export { createSbServer } from './create-sb-server';
export { ServiceBusModule } from './service-bus.module';

register();
