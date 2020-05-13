import 'reflect-metadata';

export {
  GtColumn,
  GtIndex,
  GtMethod,
  GtPlugin,
  GtDocument, GtSubDocument,
  GtSchemaType,

  GtVersionKey,
  GtTimestampCreated, GtTimestampUpdated,
  GtToJSON, GtToObject,
  GtSkipVersioning,
  GtDiscriminator,

  GtInitHook, GtValidateHook, GtSaveHook, GtRemoveHook, GtDeleteOneHook, GtUpdateOneHook,
  GtInsertManyHook,

  GtLocalProp,
} from './decorators';

export {
  GtIndexOptions, GtIndexSortOrder,
  GtConnectOptions, GtBeforeCompileModelHandler,
  GtColumnMetadataArgs,
  GtSingleIndexMetadataArgs, GtCompoundIndexMetadataArgs,
  GtPluginMetadataArgs,
  GtSchemaTypeMetadataArgs, GtSubDocumentMetadataArgs, GtDocumentMetadataArgs,
} from './interfaces';
export * from './interfaces/mongoose';

export {
  GtQuery,
  GtResource, GtModel,
  Resource, SubDocument, Model,
} from './model';

export {
  ObjectId,
  DocumentArray,
} from './build-in-schema-types';

export {
  getSchemaOf,
  getDiscriminatorKeyFor,
  getDiscriminatorKeysOf,
  findModels,
  getEnum,
  mapSchemaType,
} from './store';

export { addConnection } from './connection';

export {
  Type,
  Ctor,
  StripDoc,
  StripDoColumns,
  ClassDecoratorOf,
  StaticMethodDecoratorOf,
  MethodDecoratorOf,
  PropertyDecoratorOf,
} from './utils';
