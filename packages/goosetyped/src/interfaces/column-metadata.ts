import { Schema, SchemaType } from 'mongoose';
import { Type } from '../utils';
import { ColumnRequired, Validator } from './mongoose';

export interface GtColumnMetadataArgs<T> {

  /**
   * Set's the type used by this column.
   */
  type?: Schema | typeof SchemaType | ( () => Type<any, any> );
  enum?: string[] | number[] | object;

  /**
   * Sets a default value or value for the path.
   * If the value is a function, the return value of the function is used as the default.
   *
   * @link https://mongoosejs.com/docs/api/schematypeoptions.html#schematypeoptions_SchemaTypeOptions-default
   */
  default?: T | ( (...args: any[]) => T );

  /**
   * If true adds a required validator for this property
   *
   * @link https://mongoosejs.com/docs/api/schematypeoptions.html#schematypeoptions_SchemaTypeOptions-required
   * @defaultValue false
   */
  required?: ColumnRequired;

  /**
   * Defines this path as immutable. Mongoose prevents you from changing immutable paths unless the parent document has isNew: true.
   *
   * @link https://mongoosejs.com/docs/api.html#schematype_SchemaType-immutable
   * @defaultValue false
   */
  immutable?: boolean;

  /**
   * Adds validator(s) for this document path.
   * Validators always receive the value to validate as their first argument
   * and must return Boolean. Returning false means validation failed.
   *
   * @link https://mongoosejs.com/docs/api.html#schematype_SchemaType-validate
   */
  validate?: Validator;

  /**
   * Set to true if this path should always be included in the results, false if it should be excluded by default.
   * This setting can be overridden at the query level.
   *
   * @link https://mongoosejs.com/docs/api/schematype.html#schematype_SchemaType-select
   * @defaultValue true
   */
  select?: boolean;

  /**
   * Allows excluding paths from versioning (i.e., the internal revision will not be incremented even if these paths are updated).
   * DO NOT do this unless you know what you're doing. For sub-documents, include this on the parent document using the fully qualified path.
   *
   * You can also use the dedicated decorator `@SkipVersioning()`
   * @link https://mongoosejs.com/docs/4.x/docs/guide.html#skipVersioning
   */
  skipVersioning?: boolean;
}
