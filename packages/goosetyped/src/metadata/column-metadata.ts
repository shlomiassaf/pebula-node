// tslint:disable: ban-types
import { GtColumnMetadataArgs } from '../interfaces';
import { GtSchemaContainer } from '../store';
import { getMemberType } from '../utils';
import { resolveColumnType, ResolvedColumnType } from '../type-logic';

export class GtColumnMetadata {
  static setMetadata(metadataOptions: GtColumnMetadataArgs<any>,
                     decoratorArgs: { target: object; key?: string; },
                     container: GtSchemaContainer) {
    const { key } = decoratorArgs;
    const metadata = new GtColumnMetadata(key, metadataOptions);
    container.addColumn(metadata);
  }

  get isContainer() { return this.resolvedColumnType.isContainer; }
  get schema() { return this.resolvedColumnType.schema; }

  public resolvedColumnType: ResolvedColumnType;

  constructor(public readonly key: string, public readonly options: GtColumnMetadataArgs<any>) { }

  resolveType(target: object) {
    if (!this.resolvedColumnType) {
      this.resolvedColumnType = resolveColumnType(this.options, getMemberType(target, this.key));
    }
  }
}
