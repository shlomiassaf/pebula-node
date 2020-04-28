import { SubscriberMetadataForTarget, EmitterMetadataForTarget, SbInterceptorMetadataForTarget } from '../decorators';
import {
  SERVICE_BUS_CLIENT_EMITTER_CONFIGURATION_METADATA,
  SERVICE_BUS_SERVER_SUBSCRIBER_CONFIGURATION_METADATA,
  SERVICE_BUS_INTERCEPTORS_METADATA,
} from '../constants';

export class SbDiscoveryMetadataExplorer {

  *scanForEmitterHooks(instance: object): IterableIterator<EmitterMetadataForTarget[0]> {
    const proto = Reflect.getPrototypeOf(instance);
    const emitters: EmitterMetadataForTarget = Reflect.getMetadata(SERVICE_BUS_CLIENT_EMITTER_CONFIGURATION_METADATA, proto);
    if (Array.isArray(emitters)) {
      for (const emitter of emitters) {
        yield emitter;
      }
    }
  }

  *scanForSubscriberHooks(instance: object): IterableIterator<SubscriberMetadataForTarget[0]> {
    const proto = Reflect.getPrototypeOf(instance);
    const subscribers: SubscriberMetadataForTarget = Reflect.getMetadata(SERVICE_BUS_SERVER_SUBSCRIBER_CONFIGURATION_METADATA, proto);
    if (Array.isArray(subscribers)) {
      for (const subscriber of subscribers) {
        yield subscriber;
      }
    }
  }

  // tslint:disable-next-line: max-line-length
  *scanForInterceptorHooks(instance: object): IterableIterator<{ key: string | symbol; metadata: ReturnType<SbInterceptorMetadataForTarget['get']> }> {
    const proto = Reflect.getPrototypeOf(instance);
    const subscribers: SbInterceptorMetadataForTarget = Reflect.getMetadata(SERVICE_BUS_INTERCEPTORS_METADATA, proto);
    if (subscribers) {
      for (const [key, metadata]  of subscribers.entries()) {
        yield { key, metadata };
      }
    }
  }
}
