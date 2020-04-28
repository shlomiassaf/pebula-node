import { Document, Types } from 'mongoose';
import { CoreMongooseArray } from './array';

/**
 * Represents an instance of an array of documents.
 */
export interface CoreDocumentArray<T extends Document> extends CoreMongooseArray<T> {
  readonly isMongooseArray: boolean;
  readonly isMongooseDocumentArray: boolean;

  $parent<P extends Document = Document>(): P;

  /**
   * Creates a subdocument casted to this schema.
   * This is the same subdocument constructor used for casting.
   * @param obj the value to cast to this arrays SubDocument schema
   */
  create(obj: any): T;

  /**
   * Searches array items for the first document with a matching _id.
   * @returns the subdocument or null if not found.
   */
  id(id: Types.ObjectId | string | number): T;

  /** Helper for console.log */
  inspect(): T[];

  /**
   * Returns a native js Array of plain js objects
   * @param options optional options to pass to each documents toObject
   *   method call during conversion
   */
  toObject(options?: any): T[];
}
