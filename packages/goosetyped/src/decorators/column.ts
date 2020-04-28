import { GtColumnMetadataArgs } from '../interfaces';
import { GtColumnMetadata } from '../metadata';
import { gtSchemaStore } from '../store';
import { PropertyDecoratorOf } from '../utils';

export function GtColumn<T = any>(metadata?: GtColumnMetadataArgs<T>): PropertyDecoratorOf<any> {
  return (target: object, key: string): void => {
    gtSchemaStore.getCreate(target).setMetadata(GtColumnMetadata, metadata || {}, { target, key });
  };
}
