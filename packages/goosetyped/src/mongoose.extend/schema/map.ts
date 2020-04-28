import { Schema } from 'mongoose';
import { SchemaTypePath } from '../schema-type';

export interface MapPath extends SchemaTypePath, Schema.Types.Map {
}
