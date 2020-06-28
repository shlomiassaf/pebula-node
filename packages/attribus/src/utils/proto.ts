// tslint:disable: ban-types
import { Cls } from './types';
import { isFunction } from './misc';

export function getBaseClass(cls: Cls<any> | Function): Cls<any> | null {
  const proto = Object.getPrototypeOf(cls.prototype);
  return !proto || isFunction(proto) ? proto : proto.constructor;
}
