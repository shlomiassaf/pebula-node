// tslint:disable: max-classes-per-file
// tslint:disable: ban-types
import * as mongoose from 'mongoose';
import * as mongodb from 'mongodb';
import { GtSchemaMetadataArgs, GtSubDocumentMetadataArgs, GtDocumentMetadataArgs } from '../interfaces';
import { GtSchemaContainer } from '../store';
import { createModelName, bulkSetIfExists } from '../utils';

const PASS_THROUGH_MODEL_OPTIONS: Array<keyof GtDocumentMetadataArgs & keyof mongoose.SchemaOptions> = [
  'autoIndex',
  'autoCreate' as any, // added in 5.3.0 but not yet in d.ts
  'bufferCommands',
  'capped',
  'minimize',
  'collation',
];

export class GtSchemaMetadata {

  static setMetadata(metadataOptions: GtSchemaMetadataArgs,
                     decoratorArgs: { target: Function },
                     container: GtSchemaContainer) {
    const schemaMetadata = new this(decoratorArgs.target, metadataOptions);
    schemaMetadata.updateSchemaOptionsFromSchemaMetadata(container);
    return schemaMetadata;
  }

  readonly name: string;

  id?: boolean;
  toObject?: mongoose.DocumentToObjectOptions;
  toJSON?: mongoose.DocumentToObjectOptions;

  constructor(target: Function, metadata: GtSchemaMetadataArgs) {
    this.name = createModelName(target);
    bulkSetIfExists(metadata, this as GtSchemaMetadata)
      .set('id')
      .set('toObject')
      .set('toJSON');
  }

  protected updateSchemaOptionsFromSchemaMetadata(container: GtSchemaContainer): void {
    if ('id' in this) {
      container.setSchemaOptions('id', this.id);
    }
    if (this.toObject) {
      // TODO: If already exists (from decorator GtToObject) do not set and post a WARNING
      container.setSchemaOptions('toObject', this.toObject);
    }
    if (this.toJSON) {
      // TODO: If already exists (from decorator GtToJSON) do not set and post a WARNING
      container.setSchemaOptions('toJSON', this.toJSON);
    }
  }
}

export class GtSubDocumentMetadata extends GtSchemaMetadata {

  noId: boolean;

  constructor(target: Function, metadata: GtSubDocumentMetadataArgs) {
    super(target, metadata);
    bulkSetIfExists(metadata, this as GtSubDocumentMetadata)
      .set('noId', false);
  }

  protected updateSchemaOptionsFromSchemaMetadata(container: GtSchemaContainer): void {
    super.updateSchemaOptionsFromSchemaMetadata(container);
    if (this.noId) {
      container.setSchemaOptions('_id', false);

      // Because we create the schema empty and define the options later we end up with an _id path automatically
      // added by mongoose since the default option for _id is true... we also need to remove it.
      if (!!container.schema.path('_id')) {
        container.schema.remove('_id');
      }
      container.setSchemaOptions('id', false);
    }
  }
}

export class GtDocumentMetadata extends GtSchemaMetadata {
  collection?: string;
  skipInit?: boolean;
  connectionId?: string;

  autoIndex?: boolean;
  autoCreate?: boolean;
  bufferCommands?: boolean;
  capped?: boolean | number | { size?: number; max?: number; autoIndexId?: boolean; };
  minimize?: boolean;
  collation?: mongodb.CollationDocument;

  constructor(target: Function, metadata: GtDocumentMetadataArgs) {
    super(target, metadata);
    bulkSetIfExists(metadata, this as GtDocumentMetadata)
      .set('collection')
      .set('skipInit', false)
      .set('connectionId');

    for (const k of PASS_THROUGH_MODEL_OPTIONS) {
      if (k in metadata) {
        this[k as any] = metadata[k];
      }
    }
  }

  protected updateSchemaOptionsFromSchemaMetadata(container: GtSchemaContainer): void {
    super.updateSchemaOptionsFromSchemaMetadata(container);
    for (const k of PASS_THROUGH_MODEL_OPTIONS) {
      if (k in this) {
        container.setSchemaOptions(k, this[k]);
      }
    }
  }
}
