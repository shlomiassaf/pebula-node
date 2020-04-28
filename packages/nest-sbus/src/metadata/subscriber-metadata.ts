import { SbSubscriberTypeMap, SbSubscriberMetadataOptions, MetaOrMetaFactory } from '../interfaces';
import { isFunction } from 'util';

export class SbSubscriberMetadata<T extends keyof SbSubscriberTypeMap = keyof SbSubscriberTypeMap> {
  static is(obj: any): obj is SbSubscriberMetadata {
    return obj instanceof SbSubscriberMetadata;
  }

  get ready(): boolean { return !this.metaFactory; }
  metaOptions: SbSubscriberTypeMap[T] extends SbSubscriberMetadataOptions ? SbSubscriberTypeMap[T] : SbSubscriberMetadataOptions;
  private metaFactory?: (helper?: any) => SbSubscriberTypeMap[T] | Promise<SbSubscriberTypeMap[T]>;

  constructor(public readonly type: T,
              metaOptions: SbSubscriberTypeMap[T] extends SbSubscriberMetadataOptions ? MetaOrMetaFactory<SbSubscriberTypeMap[T]> : never) {
    if (isFunction(metaOptions)) {
      this.metaFactory = metaOptions as any;
    } else {
      this.metaOptions = { ...(metaOptions as any) };
    }
  }

  async init(helper?: any) {
    if (this.metaFactory) {
      this.metaOptions = (await Promise.resolve(this.metaFactory(helper)) as any);
      this.metaFactory = undefined;
    }
  }
}
