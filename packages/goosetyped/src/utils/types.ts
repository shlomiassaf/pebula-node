// tslint:disable: ban-types
import { Document } from 'mongoose';
import { Subtract, SetDifference, NonFunctionKeys } from 'utility-types';

export interface Ctor<T> extends Function {
  // tslint:disable-next-line: callable-types
  new (...args: any[]): T;
}

export type Type<TInstance, TStatic> = Ctor<TInstance> & TStatic;

export type ClassDecoratorOf<TInstance, TStatic = any> = (target: Type<TInstance, TStatic>) => any;

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

/**
 * A type helper that strips away all members of the mongoose Document instance from the type
 *
 * @example
 * ````ts
 * export class Message extends GtModel() {
 *  id: string;
 *  text: string;
 *  myMethod(): void { }
 * }
 *
 * const msg = new Message(); // Not the msg instance has a lot of members from the Document type (The instance of Model)
 * const m: StripDoc<Message>; // now m has only "myMethod" & "text" but not "id"
 *
 * // Since "id" also exists in Document, to include it we need to exclude it from the strip.
 * const m: StripDoc<Message, 'id'>; // now m has "id", "myMethod" & "text"
 * ```
 */
export type StripDoc<T extends Document, TExcept extends keyof Document = never> = Subtract<T, Omit<Document, TExcept>>;

/**
 * A type helper that strips away all members of the mongoose Document instance from the type as well as all methods.
 *
 * @example
 * ````ts
 * export class Message extends GtModel() {
 *  id: string;
 *  text: string;
 *  myMethod(): void { }
 * }
 *
 * const msg = new Message(); // Not the msg instance has a lot of members from the Document type (The instance of Model)
 * const m: StripDoColumns<Message>; // now m has only "text" but not "id"
 *
 * // Since "id" also exists in Document, to include it we need to exclude it from the strip.
 * const m: StripDoColumns<Message, 'id'>; // now m has "id" & "text"
 * ```
 */
export type StripDoColumns<T extends Document, TExcept extends keyof Document = never>
  = Pick<T, SetDifference<NonFunctionKeys<T>, Exclude<keyof Document, TExcept>>>;
