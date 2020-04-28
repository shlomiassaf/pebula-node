// tslint:disable: ban-types
import { GtPluginMetadataArgs } from '../interfaces';
import { GtSchemaContainer } from '../store';

export class GtPluginMetadata {
  static setMetadata(metadataOptions: GtPluginMetadataArgs,
                     decoratorArgs: { target: object | Function; key?: string | symbol; descriptor?: PropertyDescriptor },
                     container: GtSchemaContainer) {
    container.schema.plugin(metadataOptions.plugin, metadataOptions.options);
  }
}
