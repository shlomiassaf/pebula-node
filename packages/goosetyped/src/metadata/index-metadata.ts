// tslint:disable: max-classes-per-file
// tslint:disable: ban-types
import { GtSingleIndexMetadataArgs, GtCompoundIndexMetadataArgs } from '../interfaces';
import { GtSchemaContainer } from '../store';

function toCompoundIndex(key: string, metadataOptions?: GtSingleIndexMetadataArgs): GtCompoundIndexMetadataArgs {
  const sort = (metadataOptions && metadataOptions.sort) || 'asc';
  const options = metadataOptions ? metadataOptions.options : undefined;

  return {
    indices: {
      [key]: sort,
    },
    options,
  };
}

function normalizeIndices(indices: GtCompoundIndexMetadataArgs['indices']) {
  const result: any = {};
  for (const k of Object.keys(indices)) {
    result[k] = indices[k] === 'desc' ? -1 : 1;
  }
  return result;
}

export abstract class GtIndexMetadata {

  static setMetadata(metadataOptions: GtSingleIndexMetadataArgs | GtCompoundIndexMetadataArgs,
                     decoratorArgs: { target: object | Function; key?: string | symbol; descriptor?: PropertyDescriptor },
                     container: GtSchemaContainer) {
    const { indices, options } = !!decoratorArgs.key
      ? toCompoundIndex(decoratorArgs.key as string, metadataOptions as GtSingleIndexMetadataArgs)
      : metadataOptions as GtCompoundIndexMetadataArgs
    ;

    if (Object.keys(indices).length === 0) {
      throw new Error('Invalid index or indices set, at least 1 index key is required');
    }
    container.schema.index({ ...normalizeIndices(indices) }, options);
  }

}
