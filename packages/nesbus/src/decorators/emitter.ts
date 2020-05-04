import { SbQueueEmitterMetadataOptions, SbTopicMetadataOptions, MetaOrMetaFactory } from '../interfaces';
import { SbEmitterMetadata } from '../metadata';
import { SERVICE_BUS_CLIENT_EMITTER_CONFIGURATION_METADATA } from '../constants';

export type EmitterMetadataForTarget = Array<{
  key: string | symbol;
  metadata: SbEmitterMetadata;
}>;

function storeMetadata(target: object, key: string | symbol, metadata: SbEmitterMetadata): void {
  const col: EmitterMetadataForTarget = Reflect.getMetadata(SERVICE_BUS_CLIENT_EMITTER_CONFIGURATION_METADATA, target) || [];
  if (col.push({ key, metadata }) === 1) {
    Reflect.defineMetadata(SERVICE_BUS_CLIENT_EMITTER_CONFIGURATION_METADATA, col, target);
  }
}

/**
 * Subscribes to incoming events from a queue
 */
export const QueueEmitter = (metadata: MetaOrMetaFactory<SbQueueEmitterMetadataOptions>): PropertyDecorator => {
  return (target: object, key: string | symbol) => storeMetadata(target, key, new SbEmitterMetadata('queue', metadata));
};

/**
 * Subscribes to incoming events from a topic
 */
export const Topic = (metadata: MetaOrMetaFactory<SbTopicMetadataOptions>): PropertyDecorator => {
  return (target: object, key: string | symbol) => storeMetadata(target, key, new SbEmitterMetadata('topic', metadata));
};
