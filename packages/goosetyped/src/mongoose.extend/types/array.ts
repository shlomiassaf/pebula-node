import { Schema } from 'mongoose';

export interface CoreMongooseArray<T> extends Array<T> {
  validators: any[];
  hasAtomics(): boolean;
  $schema(): Schema;
  $parent(): any;
  $path(): string;
}
