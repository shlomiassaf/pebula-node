// tslint:disable: ban-types
import { Cls } from './types';
import { isFunction } from './misc';

export function getBaseClass(cls: Cls<any> | Function): Cls<any> | null {
  const proto = Object.getPrototypeOf(cls.prototype);
  return !proto || isFunction(proto) ? proto : proto.constructor;
}

export function getInheritanceChain(cls: Cls<any>, skipSelf = false): Array<Cls<any>> {
  const classes = [];
  while (cls && cls !== Object) {
    classes.push(cls);
    cls = getBaseClass(cls);
  }
  if (skipSelf) {
    classes.shift();
  }
  return classes;
}

export function extendsClass<TBase extends Cls<any>>(cls: Cls<any> | Function, base: TBase): cls is TBase {
  if (!cls) {
    return false;
  } else if (cls === base) {
    return true;
  } else {
    return cls.prototype ? extendsClass(getBaseClass(cls), base) : false;
  }
}
