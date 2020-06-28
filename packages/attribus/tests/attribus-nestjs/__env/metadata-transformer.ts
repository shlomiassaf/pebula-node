import {
  MetadataTransformer,
  SbQueueSubscriptionMetadataOptions,
  SbSubscriptionMetadataOptions,
  SbQueueMetadataOptions,
  SbTopicMetadataOptions,
} from '@pebula/attribus/nestjs';

export class TestMetadataTransformer implements MetadataTransformer {
  async queueSubscription(target: any, key: string | symbol, options: SbQueueSubscriptionMetadataOptions) {
  }

  async topicSubscription(target: any, key: string | symbol, options: SbSubscriptionMetadataOptions) {
    
  }
  async queue(target: any, key: string | symbol, options: SbQueueMetadataOptions) {
    
  }
  async topic(target: any, key: string | symbol, options: SbTopicMetadataOptions) {
    
  }
}
