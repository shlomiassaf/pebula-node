import { SbQueueMetadataOptions, SbTopicMetadataOptions } from '../../interfaces';
import { globalMetadataStore } from '../metadata-store';

/**
 * Subscribes to incoming events from a queue
 */
export const QueueEmitter = (metadata: SbQueueMetadataOptions): PropertyDecorator => {
  return (target: object, key: string | symbol) => globalMetadataStore.getCreate(target.constructor).addQueueEmitter(metadata, key);
};

/**
 * Subscribes to incoming events from a topic
 */
export const Topic = (metadata: SbTopicMetadataOptions): PropertyDecorator => {
  return (target: object, key: string | symbol) => globalMetadataStore.getCreate(target.constructor).addTopic(metadata, key);
};
