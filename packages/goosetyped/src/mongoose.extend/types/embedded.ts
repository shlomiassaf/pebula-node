import {  Document } from 'mongoose';
import { Ctor } from '../../utils';

/**
 * The runtime type of nested document in an array.
 */
export interface EmbeddedDocument extends Document {

}

export interface EmbeddedDocumentStatic<T> extends Ctor<EmbeddedDocument> {
  discriminators: { [key: string]: any };
}
