import { Ctor } from '../utils';
import { MetadataTarget } from './metadata-target';

export class MetadataStore {

  private targets = new Map<Ctor<any>, MetadataTarget>();

  has(target: Ctor<any>) {
    return this.targets.has(target);
  }

  get(target: Ctor<any>): MetadataTarget | undefined {
    return this.targets.get(target);
  }

  getCreate(target: Ctor<any> | Function): MetadataTarget {
    let meta = this.targets.get(target as Ctor<any>);
    if (!meta) {
      meta = new MetadataTarget(target as Ctor<any>);
      this.targets.set(target as Ctor<any>, meta);
    }
    return meta;
  }

  getTargets() {
    return this.targets.entries();
  }
}

export const globalMetadataStore = new MetadataStore();
