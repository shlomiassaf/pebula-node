import { SbEmitterTypeMap, SbEmitterMetadataOptions } from '../../interfaces';

export class SbEmitterMetadata<T extends keyof SbEmitterTypeMap = keyof SbEmitterTypeMap> {
  static is(obj: any): obj is SbEmitterMetadata {
    return obj instanceof SbEmitterMetadata;
  }

  get ready(): boolean { return this._ready; }

  metaOptions: SbEmitterTypeMap[T] extends SbEmitterMetadataOptions ? SbEmitterTypeMap[T] : SbEmitterMetadataOptions;

  private _ready = false;

  constructor(public readonly type: T,
              metaOptions: SbEmitterTypeMap[T] extends SbEmitterMetadataOptions ? SbEmitterTypeMap[T] : never) {
    this.metaOptions = { ...(metaOptions as any) };
  }

  async init() {
    this._ready = true;
    Object.freeze(this.metaOptions);
    Object.freeze(this);
  }
}
