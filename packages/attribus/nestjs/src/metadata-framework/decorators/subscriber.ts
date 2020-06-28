import { OperatorFunction } from 'rxjs';
import { Ctor, SbContext, SbInterceptor } from '@pebula/attribus';
import { SERVICE_BUS_INTERCEPTORS_METADATA } from '../../constants';

export type SbInterceptorMetadataForTarget = Map<string | symbol, Array<SbInterceptor | Ctor<SbInterceptor>>>;

export function SbNestIntercept(...interceptors: Array<SbInterceptor | Ctor<SbInterceptor>>) {
  return <T extends Record<K, OperatorFunction<SbContext, any>>, K extends string>(target: T, key: K): void => {
     const ctrlInterceptors: SbInterceptorMetadataForTarget
      = Reflect.getMetadata(SERVICE_BUS_INTERCEPTORS_METADATA, target) || new Map<string | symbol, Array<SbInterceptor | Ctor<SbInterceptor>>>();

    if (ctrlInterceptors.size === 0) {
      Reflect.defineMetadata(SERVICE_BUS_INTERCEPTORS_METADATA, ctrlInterceptors, target);
    }

    if (!ctrlInterceptors.has(key)) {
      ctrlInterceptors.set(key, []);
    }
    ctrlInterceptors.get(key).push(...interceptors);
  };
}
