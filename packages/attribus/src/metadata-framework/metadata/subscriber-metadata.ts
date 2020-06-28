import { isFunction } from 'util';
import { SbSubscriberTypeMap, SbSubscriberMetadataOptions, SbInterceptor } from '../../interfaces';

export class SbSubscriberMetadata<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> {
  static is(obj: any): obj is SbSubscriberMetadata {
    return obj instanceof SbSubscriberMetadata;
  }

  readonly handlerType: 'method' | 'pipe';
  readonly interceptors: Array<SbInterceptor> = [];

  get ready(): boolean { return this._ready; }

  metaOptions: SbSubscriberTypeMap[T] extends SbSubscriberMetadataOptions ? SbSubscriberTypeMap[T] : SbSubscriberMetadataOptions;

  private _ready = false;

  constructor(public readonly type: T,
              metaOptions: SbSubscriberTypeMap[T] extends SbSubscriberMetadataOptions ? SbSubscriberTypeMap[T] : never,
              public readonly descriptor?: PropertyDescriptor) {
    this.metaOptions = { ...(metaOptions as any) };
    this.handlerType = descriptor && isFunction(descriptor.value) ? 'method' : 'pipe';
  }

  addInterceptors(interceptors: Array<SbInterceptor>) {
    // TODO: throw if `this.descriptor` exists (interceptors are only for streams)
    this.interceptors.push(...interceptors);
  }

  async init() {
    this._ready = true;

    Object.freeze(this.metaOptions);
    Object.freeze(this);
  }
}
