// tslint:disable: ban-types
import { GtSchemaContainer } from '../store';

export interface SchemaAwareMetadataClass<TMetaArgs> {
  setMetadata(metadataOptions: TMetaArgs,
              decoratorArgs: { target: object | Function; key?: string | symbol; descriptor?: PropertyDescriptor },
              container: GtSchemaContainer);
}
