import { OperatorFunction } from 'rxjs';
import { SbQueueSubscriptionMetadataOptions, SbSubscriptionMetadataOptions, SbInterceptor } from '../../interfaces';
import { SbContext } from '../../sb-context';
import { globalMetadataStore } from '../metadata-store';

export type PropOrMethodDecorator<TVar, TTrue> = TVar extends TTrue
  ? MethodDecorator
  : <T extends Record<K, OperatorFunction<SbContext, any>>, K extends string>(target: T, key: K) => void
;

/**
 * Subscribes to incoming events from a queue
 */
export function Queue<T = false>(metadata: SbQueueSubscriptionMetadataOptions): PropOrMethodDecorator<T, MethodDecorator> {
  return ((target: object, key: string | symbol, descriptor?: PropertyDescriptor) => {
    globalMetadataStore.getCreate(target.constructor).addQueue(metadata, key, descriptor);
  }) as any;
}

/**
 * Subscribes to incoming events from a topic
 */
export function Subscription<T = false>(metadata: SbSubscriptionMetadataOptions): PropOrMethodDecorator<T, MethodDecorator> {
  return ((target: object, key: string | symbol, descriptor?: PropertyDescriptor) => {
    globalMetadataStore.getCreate(target.constructor).addSubscription(metadata, key, descriptor);
  }) as any;
}

export function SbIntercept(...interceptors: Array<SbInterceptor>) {
  return <T extends Record<K, OperatorFunction<SbContext, any>>, K extends string>(target: T, key: K): void => {
    globalMetadataStore.getCreate(target.constructor).addInterceptor(interceptors, key);
  };
}
