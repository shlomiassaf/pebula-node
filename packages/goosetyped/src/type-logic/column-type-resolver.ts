// tslint:disable: ban-types
import { SchemaType, Schema } from 'mongoose';
import { GtColumnMetadataArgs } from '../interfaces';
import { gtSchemaStore, getSchemaType } from '../store';
import { extendsClass, Ctor } from '../utils';
import { ResolvedColumnType, ResolveType } from './interfaces';
import { createFinalColumnTypes } from './mongo-type-resolver';
import { isContainerResolveType } from './utils';

function findMongoTypeForRuntimeType(tsType: Ctor<any>) {
  if (tsType) {
    const schemaType = getSchemaType(tsType);
    if (schemaType) {
      return schemaType;
    }
  
    const schemaContainer = gtSchemaStore.get(tsType);
    if (schemaContainer) {
      return schemaContainer.schema;
    }
  }
}

function resolveType(tsType: Ctor<any>): ResolveType {
  const type = findMongoTypeForRuntimeType(tsType);
  return { tsType, type };
}

export function resolveColumnType(metadata: GtColumnMetadataArgs<any>, reflectedTsType: Ctor<any>): ResolvedColumnType {
  const { type } = metadata;
  const reflectedType = resolveType(reflectedTsType);
  let userType: ResolvedColumnType['userType'];

  if (type instanceof Schema ) {
    userType = { type };
  } else if (extendsClass(type, SchemaType)) {
    userType = {
      type: { schemaType: type },
    };
  } else {
    const runtimeType = type ? type() : undefined;
    if (runtimeType) {
      userType = resolveType(runtimeType);
    }
  }

  const isContainer = !!isContainerResolveType(reflectedType);
  const { underlyingType, schema } = createFinalColumnTypes(reflectedType, userType, metadata);
  return { schema, underlyingType, isContainer, reflectedType, userType };
}
