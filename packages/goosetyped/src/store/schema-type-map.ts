import { Schema, SchemaTypeOpts, SchemaType } from 'mongoose';
import { GtSchemaTypeMetadataArgs } from '../interfaces';

const schemaTypeMap = new Map<any, GtSchemaTypeMetadataArgs>();

schemaTypeMap.set(String, { schemaType: Schema.Types.String });
schemaTypeMap.set(Number, { schemaType: Schema.Types.Number });
schemaTypeMap.set(Boolean, { schemaType: Schema.Types.Boolean });
schemaTypeMap.set(Date, { schemaType: Schema.Types.Date });
schemaTypeMap.set(Object, { schemaType: Schema.Types.Mixed });

const ArrayTypeMetadata: GtSchemaTypeMetadataArgs = {
  schemaType: Schema.Types.Array,
  isContainer: true,
  toSchema(reflectedType: typeof SchemaType | Schema, userType?: typeof SchemaType | Schema) {
    const arraySchemaTypeOpts: SchemaTypeOpts<any> = {
     type: [userType],
    };
    return arraySchemaTypeOpts;
  },
};
schemaTypeMap.set(Array, ArrayTypeMetadata);

const MapTypeMetadata: GtSchemaTypeMetadataArgs = {
  schemaType: Schema.Types.Map,
  isContainer: true,
  toSchema(reflectedType: typeof SchemaType | Schema, userType?: typeof SchemaType | Schema) {
    const mapSchemaTypeOpts: SchemaTypeOpts<any> = {
      type: reflectedType,
      of: userType,
    };
    return mapSchemaTypeOpts;
  },
};
schemaTypeMap.set(Map, MapTypeMetadata);

export function mapSchemaType(runtimeType: any, metadata: GtSchemaTypeMetadataArgs): void {
  schemaTypeMap.set(runtimeType, metadata);
}

export function getSchemaType(runtimeType: any): GtSchemaTypeMetadataArgs | undefined {
  return schemaTypeMap.get(runtimeType);
}
