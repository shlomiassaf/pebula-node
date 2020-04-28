import { SchemaType } from 'mongoose';
import { GtSchemaContainer } from '../../store';
import { GtColumnMetadata } from '../../metadata';
import { GtDocumentArrayPath } from './document-array-path';
import { GtMapPath } from './map';

export function createEmbeddedContainerForType(knownContainer: GtSchemaContainer, column: GtColumnMetadata): SchemaType {
  const newSchema = column.resolvedColumnType.reflectedType.tsType === Map
    ? new GtMapPath(knownContainer, column.key, column.schema.of)
    : new GtDocumentArrayPath(knownContainer, column.key, column.schema.type[0], column.schema)
  ;

  return newSchema;
}
