import * as mongoose from 'mongoose';

export interface GtPluginMetadataArgs<T = any> {
  plugin(schema: mongoose.Schema, options: T): void;
  plugin(schema: mongoose.Schema): void;
  options?: T;
}
