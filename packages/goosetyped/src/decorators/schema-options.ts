// tslint:disable: ban-types
import * as mongoose from 'mongoose';
import { gtSchemaStore, setSkipVersioning } from '../store';
import { PropertyDecoratorOf, StaticPropertyDecoratorOf, MethodDecoratorOf } from '../utils';

export function GtVersionKey<T = number>(): PropertyDecoratorOf<T> {
  return (target: object, key: string) => {
    gtSchemaStore.getCreate(target).setSchemaOptions('versionKey', key as string);
  };
}

export function GtSkipVersioning(): PropertyDecorator {
  return setSkipVersioning;
}

/**
 * A decorator for `toJSON` with a prototype bound implementation for the `transform` function.
 *
 * Note that it recommended to avoid using a transform function (through schema options) or a transform method through this decorator
 * and instead apply a transformation by overriding the `toJSON`.
 * Call the super method and apply changed to the returned value, this is much better then using an out of context transformer.
 *
 * @link https://mongoosejs.com/docs/4.x/docs/guide.html#toJSON
 */
export function GtToJSON(config?: Omit<mongoose.DocumentToObjectOptions, 'transform'>): MethodDecoratorOf<[any, any]> {
  return (target: object, key: string, descriptor: PropertyDescriptor) => {
    gtSchemaStore.getCreate(target).setSchemaOptions('toJSON', {
      ...(config || {}),
      transform: (doc, ret, options) => doc[key](ret, options),
    });
  };
}

/**
 * A decorator for `toObject` with a prototype bound implementation for the `transform` function.
 *
 * Note that it recommended to avoid using a transform function (through schema options) or a transform method through this decorator
 * and instead apply a transformation by overriding the `toObject`.
 * Call the super method and apply changed to the returned value, this is much better then using an out of context transformer.
 *
 * @link https://mongoosejs.com/docs/4.x/docs/guide.html#toObject
 */
export function GtToObject(config?: Omit<mongoose.DocumentToObjectOptions, 'transform'>): MethodDecoratorOf<[any, any]> {
  return (target: object, key: string, descriptor: PropertyDescriptor) => {
    gtSchemaStore.getCreate(target).setSchemaOptions('toObject', {
      ...(config || {}),
      transform: (doc, ret, options) => doc[key](ret, options),
    });
  };
}

export function GtTimestampCreated<T = Date>(): PropertyDecoratorOf<T> {
  return (target: object, key: string) => {
    const timestamps = getTimestamps(target);
    timestamps.createdAt = key as string;
    gtSchemaStore.getCreate(target).setSchemaOptions('timestamps', timestamps);
  };
}

export function GtTimestampUpdated<T = Date>(): PropertyDecoratorOf<T> {
  return (target: object, key: string) => {
    const timestamps = getTimestamps(target);
    timestamps.updatedAt = key as string;
    gtSchemaStore.getCreate(target).setSchemaOptions('timestamps', timestamps);
  };
}

function getTimestamps(target: object) {
  let timestamps = gtSchemaStore.getCreate(target).getSchemaOptions('timestamps');
  if (!timestamps || typeof timestamps === 'boolean') {
    timestamps = {};
  }
  return timestamps;
}
