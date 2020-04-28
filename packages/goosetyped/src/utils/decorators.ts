// tslint:disable: ban-types
import { Type } from '../interfaces';

export function getMemberType<T = any>(target: object | Function, key: string | symbol): Type<T, any> {
  return Reflect.getMetadata('design:type', target, key);
}

export function getMethodParamTypes(target: object | Function, key: string | symbol): Array<Type<any, any>> {
  return Reflect.getMetadata('design:paramtypes', target, key);
}

export function getCtorParamTypes(target: Function): Array<Type<any, any>> {
  return Reflect.getMetadata('design:paramtypes', target);
}

export function getMethodReturnType<T = any>(target: object | Function, key: string | symbol): Type<T, any> {
  return Reflect.getMetadata('design:returntype', target, key);
}
