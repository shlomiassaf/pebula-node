import { Schema, SchemaTypeOpts } from 'mongoose';
import { GtColumnMetadataArgs } from '../interfaces';
import { isFunction } from '../utils';
import { isContainerResolveType, getMongoSchemaFromResolvedType } from './utils';
import { ResolveType } from '.';
import { resolveEnum } from './enum-resolver';

const PASS_THROUGH_COLUMN_OPTIONS: Array<keyof GtColumnMetadataArgs<any>> = [
  'default',
  'immutable',
  'required',
  'validate',
  'select',
];

export function getMongoType(reflectedType: ResolveType, userType: Partial<ResolveType> | undefined) {
  const mongoType = (userType && getMongoSchemaFromResolvedType(userType)) || getMongoSchemaFromResolvedType(reflectedType);

  if (!mongoType) {
    throw new Error('Invalid type definition, could not find a valid type which maps to a Schema or SchemaType');
  }

  if (!isContainerResolveType(reflectedType)) {
    return mongoType;
  }

  const user = userType && getMongoSchemaFromResolvedType(userType);
  if (!user) {
    throw new Error('Invalid type configuration, container type requires an explicity type definition');
  }
  return reflectedType.type.toSchema(reflectedType.type.schemaType, user);
}

export function createFinalColumnTypes(reflectedType: ResolveType, userType: Partial<ResolveType> | undefined, options: GtColumnMetadataArgs<any>) {
  const schema = getMongoType(reflectedType, userType);
  const schemaTypeOpts: SchemaTypeOpts<any> = schema instanceof Schema || isFunction(schema)
    ? { type: schema }
    : schema
  ;

  const underlyingType = (userType && userType.tsType) || reflectedType.tsType;

  for (const k of PASS_THROUGH_COLUMN_OPTIONS) {
    if (k in options) {
      schemaTypeOpts[k] = options[k];
    }
  }

  if (options.enum) {
    schemaTypeOpts.enum = Array.isArray(options.enum)
      ? options.enum
      : resolveEnum(options.enum, underlyingType)
    ;
  }

  return { underlyingType, schema: schemaTypeOpts };
}
