// tslint:disable: ban-types
import { Ctor } from './types';
import { isFunction } from './misc';

export function getProtoChain(cls: Ctor<any>): Array<Ctor<any>> {
  const classes = [];
  while (cls && cls !== Object) {
    classes.push(cls);

    const proto = Object.getPrototypeOf(cls.prototype);
    cls = isFunction(proto) || !proto ? proto : proto.constructor;
  }
  return classes;
}

export function getBaseClass(cls: Ctor<any> | Function): Ctor<any> | null {
  const proto = Object.getPrototypeOf(cls.prototype);
  return !proto || isFunction(proto) ? proto : proto.constructor;
}

export function extendsClass<TBase extends Ctor<any>>(cls: Ctor<any> | Function, base: TBase): cls is TBase {
  if (!cls) {
    return false;
  } else if (cls === base) {
    return true;
  } else {
    return cls.prototype ? extendsClass(getBaseClass(cls), base) : false;
  }
}
