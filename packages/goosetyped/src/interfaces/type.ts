// tslint:disable: callable-types

export interface ConstructorType<T> extends Function {
  new (...args: any[]): T;
}

export type Type<TInstance, TStatic> = ConstructorType<TInstance> & TStatic;
