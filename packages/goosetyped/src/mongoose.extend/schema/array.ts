import { Schema } from 'mongoose';
import { SchemaTypePath } from '../schema-type';
import { Ctor } from '../../utils';

/**
 * Represents an instance of a document array Schema for a property
 */
export interface ArrayPath extends SchemaTypePath, Schema.Types.Array {
  schemaOptions: any;
  Constructor: Ctor<any> & any;
}
