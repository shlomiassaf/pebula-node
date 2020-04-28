import { OperatorFunction } from 'rxjs';
import { Type } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { SbQueueMetadataOptions, SbSubscriptionMetadataOptions, SbInterceptor, MetaOrMetaFactory } from '../interfaces';
import { SbSubscriberMetadata } from '../metadata';
import { SERVICE_BUS_SERVER_SUBSCRIBER_CONFIGURATION_METADATA, SERVICE_BUS_INTERCEPTORS_METADATA } from '../constants';
import { SbContext } from '../sb-context';

export type SubscriberMetadataForTarget = Array<{
  key: string | symbol;
  metadata: SbSubscriberMetadata;
}>;

export type SbInterceptorMetadataForTarget = Map<string | symbol, Array<SbInterceptor | Type<SbInterceptor>>>;

function storeMetadata(target: object, key: string | symbol, metadata: SbSubscriberMetadata): void {
  const col: SubscriberMetadataForTarget = Reflect.getMetadata(SERVICE_BUS_SERVER_SUBSCRIBER_CONFIGURATION_METADATA, target) || [];
  if (col.push({ key, metadata }) === 1) {
    Reflect.defineMetadata(SERVICE_BUS_SERVER_SUBSCRIBER_CONFIGURATION_METADATA, col, target);
  }
}

export type PropOrMethodDecorator<TVar, TTrue> = TVar extends TTrue
  ? MethodDecorator
  : <T extends Record<K, OperatorFunction<SbContext, any>>, K extends string>(target: T, key: K) => void
;

/**
 * Subscribes to incoming events from a queue
 */
export function Queue<T = false>(metadata: MetaOrMetaFactory<SbQueueMetadataOptions>): PropOrMethodDecorator<T, MethodDecorator> {
  return ((target: object, key: string | symbol, descriptor?: PropertyDescriptor) => {
    const sbSubscriberMetadata = new SbSubscriberMetadata('queue', metadata);
    storeMetadata(target, key, sbSubscriberMetadata);
    if (descriptor) {
      return EventPattern(sbSubscriberMetadata)(target, key, descriptor);
    }
  }) as any;
}

/**
 * Subscribes to incoming events from a topic
 */
export function Subscription<T = false>(metadata: MetaOrMetaFactory<SbSubscriptionMetadataOptions>): PropOrMethodDecorator<T, MethodDecorator> {
  return ((target: object, key: string | symbol, descriptor?: PropertyDescriptor) => {
    const sbSubscriberMetadata = new SbSubscriberMetadata('subscription', metadata);
    storeMetadata(target, key, sbSubscriberMetadata);
    if (descriptor) {
      return EventPattern(sbSubscriberMetadata)(target, key, descriptor);
    }
  }) as any;
}

export function SbIntercept(...interceptors: Array<SbInterceptor | Type<SbInterceptor>>) {
  return <T extends Record<K, OperatorFunction<SbContext, any>>, K extends string>(target: T, key: K): void => {
    const ctrlInterceptors: SbInterceptorMetadataForTarget
      = Reflect.getMetadata(SERVICE_BUS_INTERCEPTORS_METADATA, target) || new Map<string | symbol, Array<SbInterceptor | Type<SbInterceptor>>>();

    if (ctrlInterceptors.size === 0) {
      Reflect.defineMetadata(SERVICE_BUS_INTERCEPTORS_METADATA, ctrlInterceptors, target);
    }

    if (!ctrlInterceptors.has(key)) {
      ctrlInterceptors.set(key, []);
    }
    ctrlInterceptors.get(key).push(...interceptors);
  };
}
