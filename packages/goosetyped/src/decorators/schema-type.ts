// tslint:disable: ban-types
import { mapSchemaType } from '../store/schema-type-map';
import { GtSchemaTypeMetadataArgs } from '../interfaces';

export function GtSchemaType(metadata: GtSchemaTypeMetadataArgs): ClassDecorator {
  return (target: Function) => {
    mapSchemaType(target, metadata);
  };
}
