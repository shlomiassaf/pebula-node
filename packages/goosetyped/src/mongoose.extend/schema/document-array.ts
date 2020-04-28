import { Schema, Document } from 'mongoose';
import { ArrayPath } from './array';

/**
 * Represents an instance of a document array Schema for a property
 */
export interface DocumentArrayPath extends ArrayPath, Schema.Types.DocumentArray {
  schema: any;

  /**
   * Casts values for set().
   *
   * @param value
   * @param doc document that triggers the casting
   * @param init whether this is an initialization cast
   * @api private
   */
  cast(value: any, doc: Document, init: boolean, prev?: any, options?: any): any;
}
