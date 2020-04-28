import mongoose from 'mongoose';
export function isFunction(obj: any): obj is Function {
  return typeof obj === 'function';
}

export function isPromise<T = unknown>(p: any): p is Promise<T> {
  return p && (p instanceof Promise || p instanceof mongoose.Promise);
}
