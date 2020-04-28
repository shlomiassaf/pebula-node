import { Schema } from 'mongoose';
import { GtSchemaTypeContainerMetadataArgs } from '../interfaces';
import { ResolveType } from './interfaces';

export function isSchemaInstance(type: ResolveType['type']): type is Schema {
  if (type) {
    return type instanceof Schema;
  }
  return false;
}

export function isContainerResolveType(resolveType: ResolveType): resolveType is ResolveType<GtSchemaTypeContainerMetadataArgs> {
  const { type } = resolveType;
  if (type && !isSchemaInstance(type)) {
    return 'isContainer' in type && !!type.isContainer;
  }
  return false;
}

export function getMongoSchemaFromResolvedType(resolvedType: Partial<ResolveType>) {
  const { type } = resolvedType;
  if (isSchemaInstance(type)) {
    return type;
  } else if (type) {
    return type.schemaType;
  }
}
