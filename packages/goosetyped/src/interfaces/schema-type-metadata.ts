import { Schema, SchemaType, SchemaTypeOpts } from 'mongoose';

export interface GtSchemaTypeSingleMetadataArgs {
  schemaType: typeof SchemaType;
}

export interface GtSchemaTypeContainerMetadataArgs extends GtSchemaTypeSingleMetadataArgs {
  isContainer: boolean;
  toSchema(reflectedType: typeof SchemaType | Schema, userType?: typeof SchemaType | Schema): SchemaTypeOpts<any>;
}

export type GtSchemaTypeMetadataArgs = GtSchemaTypeSingleMetadataArgs | GtSchemaTypeContainerMetadataArgs;
