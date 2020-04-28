// tslint:disable: ban-types
import { GtSingleIndexMetadataArgs, GtCompoundIndexMetadataArgs } from '../interfaces';
import { GtIndexMetadata } from '../metadata';
import { gtSchemaStore } from '../store';

export function GtIndex(metadata?: GtSingleIndexMetadataArgs): PropertyDecorator;
export function GtIndex(metadata: GtCompoundIndexMetadataArgs): ClassDecorator;
export function GtIndex(metadata?: GtSingleIndexMetadataArgs | GtCompoundIndexMetadataArgs): ClassDecorator | PropertyDecorator {
  return (target: object | Function, key?: string) => {
    gtSchemaStore.getCreate(target).setMetadata(GtIndexMetadata, metadata, { target, key });
  };
}
