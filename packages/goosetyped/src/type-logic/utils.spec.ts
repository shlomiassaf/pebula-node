// tslint:disable: max-classes-per-file
import { Schema, SchemaType } from 'mongoose';
import { isSchemaInstance, isContainerResolveType, getMongoSchemaFromResolvedType } from './utils';

describe('goosetyped', () => {
  describe('Schema Builder', () => {
    describe('Column Type Logic', () => {

      it('should detect an instance of Schema', () => {
        expect(isSchemaInstance(new Schema())).toBe(true);
      });

      it('should detect if a resolved type is a container', () => {
        const nonContainerResolvedTypes = [
          { tsType: String },
          { tsType: String, type: new Schema() },
          { tsType: String, type: { schemaType: Schema.Types.String } },
        ];
        for (const c of nonContainerResolvedTypes) {
          expect(isContainerResolveType(c)).toBe(false);
        }

        const containerResolvedType = {
          tsType: Array,
          type: {
            schemaType: Schema.Types.Array,
            isContainer: true,
            toSchema(reflectedType: typeof SchemaType | Schema, userType?: typeof SchemaType | Schema) {
              return {
                type: [Schema.Types.String],
              };
            },
          },
        };
        expect(isContainerResolveType(containerResolvedType)).toBe(true);
      });

      it('should return the mongoose type from a ResolvedType', () => {
        expect(getMongoSchemaFromResolvedType({ tsType: String })).toBeFalsy();

        const schema = new Schema();
        expect(getMongoSchemaFromResolvedType({ tsType: String, type: schema })).toBe(schema);

        const schemaType = Schema.Types.String;
        expect(getMongoSchemaFromResolvedType({ tsType: String, type: { schemaType }})).toBe(schemaType);

        const containerResolvedType = {
          tsType: String,
          type: {
            schemaType: Schema.Types.Array,
            isContainer: true,
            toSchema(reflectedType: typeof SchemaType | Schema, userType?: typeof SchemaType | Schema) {
              return {
                type: [Schema.Types.String],
              };
            },
          },
        };
        expect(getMongoSchemaFromResolvedType(containerResolvedType)).toBe(Schema.Types.Array);
      });
    });
  });
});
