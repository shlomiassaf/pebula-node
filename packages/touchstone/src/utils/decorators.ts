import { DecoratorArgs, ClassDecoratorArgs, Type } from './types';
import { isFunction } from './misc';

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

export function extendDesignMetadata(base: object | Function, target: object | Function, key: string | symbol) {
  const descriptor = Object.getOwnPropertyDescriptor(base, key);
  if (!descriptor || !isFunction(descriptor.value)) {
    const meta = getMemberType(base, key);
    if (meta) {
      Reflect.defineMetadata('design:type', meta, target, key);
    }
  } else {
    const retMeta = getMethodReturnType(base, key);
    if (retMeta) {
      Reflect.defineMetadata('design:returntype', retMeta, target, key);
    }
    const metParamsMeta = getMethodParamTypes(base, key);
    if (metParamsMeta) {
      Reflect.defineMetadata('design:paramtypes', metParamsMeta, target, key);
    }
  }
}

export function toDecoratorArgs(target: Function): ClassDecoratorArgs;
export function toDecoratorArgs(target: object | Function, key: string | symbol, indexOrDescriptor?: PropertyDescriptor | number): Exclude<DecoratorArgs, ClassDecoratorArgs>;
export function toDecoratorArgs(target: object | Function, key?: string | symbol, indexOrDescriptor?: PropertyDescriptor | number): DecoratorArgs {
  if (!key) {
    return { type: 'class', target: target as Function };
  }

  // most of the calls will be for property decorators but we cant use `!indexOrDescriptor` to detect that because it might be 0
  if (typeof indexOrDescriptor === 'number') {
    return { type: 'parameter', target, key, index: indexOrDescriptor };
  } else if (!indexOrDescriptor) {
    return { type: isFunction(target) ? 'propertyStatic' : 'property', target, key };
  } else {
    return { type: isFunction(target) ? 'methodStatic' : 'method', target, key, descriptor: indexOrDescriptor };
  }
}
