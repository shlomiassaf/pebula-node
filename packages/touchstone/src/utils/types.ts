
export type Proto<T> = T & { constructor: Ctor<T> };

export interface Ctor<T> extends Function {
  new (...args: any[]): T;
}

export interface Cls<T> extends Function {
  prototype: T;
}

export type Type<TInstance, TStatic> = Ctor<TInstance> & TStatic;

export type ClassDecoratorOf<TInstance, TStatic = unknown> = (target: Type<TInstance, TStatic>) => any;

export type PropertyDecoratorOf<T> = <Z extends Partial<Record<K, T>>, K extends string>(target: Z, key: K) => void;

export type StaticPropertyDecoratorOf<T> = <Z extends Function & Partial<Record<K, T>>, K extends string>(target: Z, key: K) => void;

export type MethodDecoratorOf<TArgs extends | [any]
                                            | [any, any]
                                            | [any, any, any]
                                            | [any, any, any, any]
                                            | [any, any, any, any, any]
                                            | [any, any, any, any, any, any]
                                            | [any, any, any, any, any, any, any] = never,
                              TReturn = void> = <Z extends Partial<Record<K, (...args: TArgs) => TReturn>>, K extends string>(
  target: Z,
  key: K,
  descriptor: TypedPropertyDescriptor<(...args: TArgs) => TReturn>) => TypedPropertyDescriptor<(...args: TArgs) => TReturn> | void;

export type StaticMethodDecoratorOf<TArgs extends | [any]
                                                  | [any, any]
                                                  | [any, any, any]
                                                  | [any, any, any, any]
                                                  | [any, any, any, any, any]
                                                  | [any, any, any, any, any, any]
                                                  | [any, any, any, any, any, any, any] = never,
                                    TReturn = void> = <Z extends Function & Partial<Record<K, (...args: TArgs) => TReturn>>, K extends string>(
  target: Z,
  key: K,
  descriptor: TypedPropertyDescriptor<(...args: TArgs) => TReturn>) => TypedPropertyDescriptor<(...args: TArgs) => TReturn> | void;

export type DecoratorUnion = 
  | ClassDecorator | ClassDecoratorOf<any, any>
  | MethodDecorator | MethodDecoratorOf<any, any> | StaticMethodDecoratorOf<any, any>
  | PropertyDecorator | PropertyDecoratorOf<any> | StaticPropertyDecoratorOf<any>
  | ParameterDecorator;

export interface ClassDecoratorArgs {
  type: 'class';
  target: Function;
}

export interface ParameterDecoratorArgs {
  type: 'parameter';
  target: object;
  key: string | symbol;
  index: number;
}

export interface PropertyDecoratorArgs {
  type: 'property' | 'propertyStatic';
  target: object | Function;
  key: string | symbol;
}

export interface MethodDecoratorArgs {
  type: 'method' | 'methodStatic';
  target: object | Function;
  key: string | symbol;
  descriptor: PropertyDescriptor
}

export type DecoratorArgs = 
  | ClassDecoratorArgs
  | PropertyDecoratorArgs
  | MethodDecoratorArgs
  | ParameterDecoratorArgs;
