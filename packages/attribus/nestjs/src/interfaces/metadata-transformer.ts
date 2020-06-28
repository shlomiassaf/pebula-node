import {
  SbQueueSubscriptionMetadataOptions,
  SbSubscriptionMetadataOptions,
  SbQueueMetadataOptions,
  SbTopicMetadataOptions,
} from '@pebula/attribus';

export interface MetadataTransformer {
  queueSubscription?(target: any, key: string | symbol, options: SbQueueSubscriptionMetadataOptions): Promise<SbQueueSubscriptionMetadataOptions | void>;
  topicSubscription?(target: any, key: string | symbol, options: SbSubscriptionMetadataOptions): Promise<SbSubscriptionMetadataOptions | void>;
  queue?(target: any, key: string | symbol, options: SbQueueMetadataOptions): Promise<SbQueueMetadataOptions | void>;
  topic?(target: any, key: string | symbol, options: SbTopicMetadataOptions): Promise<SbTopicMetadataOptions | void>;
}