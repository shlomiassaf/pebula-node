import { SbEmitterTypeMap, SbEmitterMetadataOptions, MetaOrMetaFactory } from '../interfaces';
import { isFunction } from 'util';

export class SbEmitterMetadata<T extends keyof SbEmitterTypeMap = keyof SbEmitterTypeMap> {
  static is(obj: any): obj is SbEmitterMetadata {
    return obj instanceof SbEmitterMetadata;
  }

  get ready(): boolean { return !this.metaFactory; }
  metaOptions: SbEmitterTypeMap[T] extends SbEmitterMetadataOptions ? SbEmitterTypeMap[T] : SbEmitterMetadataOptions;
  private metaFactory?: (helper?: any) => SbEmitterTypeMap[T] | Promise<SbEmitterTypeMap[T]>;

  constructor(public readonly type: T,
              metaOptions: SbEmitterTypeMap[T] extends SbEmitterMetadataOptions ? MetaOrMetaFactory<SbEmitterTypeMap[T]> : never) {
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
