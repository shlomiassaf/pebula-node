export interface Ctor<T> extends Function {
  // tslint:disable-next-line: callable-types
  new (...args: any[]): T;
}

export interface Cls<T> extends Function {
  prototype: T;
}
