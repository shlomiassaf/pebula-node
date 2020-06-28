import { SERVICE_BUS_INTERCEPTORS_METADATA } from '../constants';
import { SbInterceptorMetadataForTarget } from '../metadata-framework';

export class SbDiscoveryMetadataExplorer {

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
