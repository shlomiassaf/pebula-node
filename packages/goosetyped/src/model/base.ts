// tslint:disable: max-classes-per-file
import { Model, Schema } from 'mongoose';
import { CTOR_INVOKED, GT_LOCAL_INFO, GT_SUB_DOCUMENT, GT_DOCUMENT } from './constants';
import { hasExtendingSchema, findSchemaContainerOfChildDiscriminator } from './utils';
import { syncModelInstance } from './sync';
import { GtLocalInfo } from './local-info';

const hasInstance = Function.prototype[Symbol.hasInstance];

export class GtModelContainer extends Model {
  static readonly [GT_DOCUMENT] = true;
  private static [GT_LOCAL_INFO]: GtLocalInfo;
  private readonly [CTOR_INVOKED] = true;

  static [Symbol.hasInstance](instance: any): boolean {
    if (hasInstance.call(this, instance)) {
      return true;
    } else if (instance.schema) {
      return instance.schema === this.schema || hasExtendingSchema(instance.schema, this[GT_LOCAL_INFO].container.hierarchy.extending);
    }
    return false;
  }

  constructor(doc?: any) {
    super();
    if (doc) {
      const localInfo = findSchemaContainerOfChildDiscriminator(this, this.constructor[GT_LOCAL_INFO]);
      syncModelInstance(doc, this, localInfo, true);
    }
  }
}

export class GtResourceContainer {
  static get schema(): Schema { return this[GT_LOCAL_INFO].container.schema; }
  static readonly [GT_SUB_DOCUMENT] = true;
  private static [GT_LOCAL_INFO]: GtLocalInfo;
  private readonly [CTOR_INVOKED] = true;

  static [Symbol.hasInstance](instance: any): boolean {
    if (hasInstance.call(this, instance)) {
      return true;
    } else if (instance.schema) {
      return instance.schema === this.schema || hasExtendingSchema(instance.schema, this[GT_LOCAL_INFO].container.hierarchy.extending);
    }
    return false;
  }

  constructor(doc?: any) {
    if (doc) {
      const localInfo = findSchemaContainerOfChildDiscriminator(this, this.constructor[GT_LOCAL_INFO]);
      syncModelInstance(doc, this, localInfo, true);
    }
  }
}
