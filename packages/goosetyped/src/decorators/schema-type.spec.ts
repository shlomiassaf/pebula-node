// tslint:disable: ban-types
import { Schema, Types, MongooseDocument, SchemaType, SchemaTypeOpts } from 'mongoose';
import { getSchemaType } from '../store/schema-type-map';
import { GtSchemaType } from './schema-type';

describe('goosetyped', () => {
  describe('decorators', () => {

    it('should register a schema type definitions using GtSchemaType', () => {
      const metadata = {
        schemaType: Schema.Types.Array,
        isContainer: true,
        toSchema(reflectedType: typeof SchemaType | Schema, userType?: typeof SchemaType | Schema) {
          const arraySchemaTypeOpts: SchemaTypeOpts<any> = {
           type: [userType],
          };
          return arraySchemaTypeOpts;
        },
      };

      @GtSchemaType(metadata)
      class DocumentArray<T extends MongooseDocument> extends Types.DocumentArray<T> {}

      expect(getSchemaType(DocumentArray)).toBe(metadata);
    });

  });
});
