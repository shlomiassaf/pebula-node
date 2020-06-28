import { Ctor } from '../utils';
import { SbQueueSubscriptionMetadataOptions, SbSubscriptionMetadataOptions, SbInterceptor, SbTopicMetadataOptions, SbQueueMetadataOptions } from '../interfaces';
import { SbSubscriberMetadata, SbEmitterMetadata } from './metadata';

export class MetadataTarget {

  private emitters = new Map<string | symbol, SbEmitterMetadata>();
  private subscribers = new Map<string | symbol, SbSubscriberMetadata>();
  private interceptors = new Map<string | symbol, Array<SbInterceptor>>();

  constructor(public readonly target: Ctor<any>) { }

  addTopic(metadataArgs: SbTopicMetadataOptions, key: string | symbol) {
    const metadata = new SbEmitterMetadata('topic', metadataArgs);
    this.emitters.set(key, metadata);
  }

  addQueueEmitter(metadataArgs: SbQueueMetadataOptions, key: string | symbol) {
    const metadata = new SbEmitterMetadata('queue', metadataArgs);
    this.emitters.set(key, metadata);
  }

  addQueue(metadataArgs: SbQueueSubscriptionMetadataOptions, key: string | symbol, descriptor?: PropertyDescriptor) {
    const metadata = new SbSubscriberMetadata('queue', metadataArgs, descriptor);
    this.addSubscriber(metadata, key);
  }

  addSubscription(metadataArgs: SbSubscriptionMetadataOptions, key: string | symbol, descriptor?: PropertyDescriptor) {
    const metadata = new SbSubscriberMetadata('subscription', metadataArgs, descriptor);
    this.addSubscriber(metadata, key);
  }

  addInterceptor(interceptors: Array<SbInterceptor>, key: string | symbol) {
    if (!this.subscribers.has(key)) {
      const collection = this.interceptors.get(key) || [];
      if (collection.length === 0) {
        this.interceptors.set(key, collection); 
      }
      collection.push(...interceptors);
    } else {
      this.subscribers.get(key).addInterceptors(interceptors);
    }
  }

  getEmitter(key: string | symbol) {
    return this.emitters.get(key);
  }

  getEmitters() {
    return this.emitters.entries();
  }

  getSubscription(key: string | symbol) {
    return this.subscribers.get(key);
  }

  getSubscriptions() {
    // TODO: check at the end that there are no interceptors left in `this.interceptors`
    return this.subscribers.entries();
  }

  private addSubscriber(metadata: SbSubscriberMetadata, key: string | symbol) {
    this.subscribers.set(key, metadata);

    const interceptors = this.interceptors.get(key);
    if (Array.isArray(interceptors)) {
      metadata.addInterceptors(interceptors);
      this.interceptors.delete(key);
    }
  }
}
