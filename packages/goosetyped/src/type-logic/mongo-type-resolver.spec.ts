// tslint:disable: max-classes-per-file
import { Schema, SchemaType } from 'mongoose';
import { createFinalColumnTypes, getMongoType } from './mongo-type-resolver';

describe('goosetyped', () => {
  describe('Schema Builder', () => {
    describe('Column Type Logic', () => {

      it('should throw if there is no mongo type match', () => {
        expect(() => getMongoType({ tsType: String }, undefined))
          .toThrowError('Invalid type definition, could not find a valid type which maps to a Schema or SchemaType');
        expect(() => getMongoType({ tsType: String }, { tsType: String }))
          .toThrowError('Invalid type definition, could not find a valid type which maps to a Schema or SchemaType');
      });

      it('should resolve the main mongo type from a single-item reflected and user resolved types', () => {
        const schema = new Schema();
        const schema1 = new Schema();
        const resolvedSchemaTypeString = { tsType: String, type: { schemaType: Schema.Types.String } };
        expect(getMongoType({ tsType: String, type: schema }, { tsType: String, type: schema1 })).toBe(schema1);
        expect(getMongoType({ tsType: String, type: schema1 }, undefined)).toBe(schema1);
        expect(getMongoType(resolvedSchemaTypeString, { tsType: String, type: { schemaType: Schema.Types.Number } })).toBe(Schema.Types.Number);
        expect(getMongoType(resolvedSchemaTypeString, undefined)).toBe(Schema.Types.String);
      });

      it('should resolve the main mongo type from a collection reflected and user resolved types', () => {
        const containerResolvedType = {
          tsType: Array,
          type: {
            schemaType: Schema.Types.Array,
            isContainer: true,
            toSchema(reflectedType: typeof SchemaType | Schema, userType?: typeof SchemaType | Schema) {
              return {
                type: [userType],
              };
            },
          },
        };
        const userResolvedType = { tsType: String, type: { schemaType: Schema.Types.Number } };
        const spy = jest.spyOn(containerResolvedType.type, 'toSchema');
        getMongoType(containerResolvedType, userResolvedType)

        expect(spy).toBeCalledTimes(1);
        expect(spy).toBeCalledWith(containerResolvedType.type.schemaType, userResolvedType.type.schemaType);
        expect(spy).toReturnWith({ type: [Schema.Types.Number] });
      });

      it('should throw when the reflected type is a collection but there is no user type provided', () => {
        const containerResolvedType = {
          tsType: Array,
          type: {
            schemaType: Schema.Types.Array,
            isContainer: true,
            toSchema(reflectedType: typeof SchemaType | Schema, userType?: typeof SchemaType | Schema) {
              return {
                type: userType,
              };
            },
          },
        };
        expect(() => getMongoType(containerResolvedType, { tsType: String, type: undefined }))
          .toThrowError('Invalid type configuration, container type requires an explicity type definition');
      });

      it('should set the default option on the final schema', () => {
        const { schema } = createFinalColumnTypes({ tsType: String, type: new Schema() }, undefined, { default: '123' });
        expect(schema.default).toBe('123');
      });

      it('should set the required option on the final schema', () => {
        const { schema } = createFinalColumnTypes({ tsType: String, type: new Schema() }, undefined, { required: '123' });
        expect(schema.required).toBe('123');
      });

      it('should set the enum option on the final schema', () => {
        const enums = ['a', 'b', 'c'];
        let column = createFinalColumnTypes({ tsType: String, type: new Schema() }, undefined, { enum: enums });
        expect(column.schema.enum).toBe(enums);

        enum TestEnum {
          a = 3,
          b = 5,
          c = 9,
        }
        column = createFinalColumnTypes({ tsType: Number, type: new Schema() }, undefined, { enum: TestEnum });
        expect(column.schema.enum)
          .toEqual([3, 5, 9]);
      });

    });
  });
});
