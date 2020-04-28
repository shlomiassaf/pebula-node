// tslint:disable: ban-types
import { safeConstructor, Ctor } from '../utils';
import { GtSchemaContainer } from './schema-container';
import { Model, Resource } from '../model';

export class GtSchemaStore {
  static get(): GtSchemaStore {
    return gtSchemaStore || new GtSchemaStore();
  }

  private containers = new Map<Function, GtSchemaContainer>();

  private constructor() { }

  has(target: object | Function): boolean {
    return this.containers.has(safeConstructor(target));
  }

  get(target: object | Function): GtSchemaContainer | undefined {
    return this.containers.get(safeConstructor(target));
  }

  getCreate(target: object | Ctor<any> | Function): GtSchemaContainer {
    const ctor = safeConstructor(target);
    let result: GtSchemaContainer = this.containers.get(ctor);
    if (!result) {
      this.containers.set(ctor, result = new GtSchemaContainer(ctor, this));
    }
    return result;
  }

  findModels(query: {}): Array<Model | Resource> {
    return Array.from(this.containers.values()).map( c => c.model || c.target as any );
  }
}

export const gtSchemaStore: GtSchemaStore = GtSchemaStore.get();
