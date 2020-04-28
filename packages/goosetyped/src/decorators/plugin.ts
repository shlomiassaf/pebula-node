// tslint:disable: ban-types
import { GtPluginMetadataArgs } from '../interfaces';
import { GtPluginMetadata } from '../metadata';
import { gtSchemaStore } from '../store';

export function GtPlugin(metadata: GtPluginMetadataArgs): ClassDecorator {
  return (target: Function) => {
    gtSchemaStore.getCreate(target).setMetadata(GtPluginMetadata, metadata, { target });
  };
}
