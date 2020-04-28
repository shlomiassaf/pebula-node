// Set of mongoose based types, narrowed or better presented by this library.
// Usually this is required to eliminate old behavior that exists for legacy purpose and causes to many type possibilities.

export type ColumnRequired = boolean | string | ( () => boolean ) | [ () => boolean, string ];

export type ValidatorFn<T = any> = (value: T) => boolean | Promise<boolean>;
export interface ValidatorMessageContext {
  path: string;
  value: any;
  reason: string | Error;
}
export interface ValidatorOpts<T = any> {
  validator: ValidatorFn<T>;
  message?: string | ( (props: ValidatorMessageContext) => string );
}
/**
 * @link https://mongoosejs.com/docs/api.html#schematype_SchemaType-validate
 */
export type Validator = RegExp | ValidatorFn | ValidatorOpts | ValidatorOpts[];
