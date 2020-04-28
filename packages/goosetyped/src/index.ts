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
  GtDiscriminatorKey,
  GtSkipVersioning,
  GtDiscriminatorType,

  GtInitHook, GtValidateHook, GtSaveHook, GtRemoveHook, GtDeleteOneHook, GtUpdateOneHook,
  GtInsertManyHook,

  GtLocalProp,
} from './decorators';

export {
  GtConnectOptions, GtBeforeCompileModelHandler,
  GtColumnMetadataArgs,
  GtSingleIndexMetadataArgs, GtCompoundIndexMetadataArgs,
  GtPluginMetadataArgs,
  GtSubDocumentMetadataArgs, GtDocumentMetadataArgs,
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

export { StripDoc, StripDoColumns } from './utils';
