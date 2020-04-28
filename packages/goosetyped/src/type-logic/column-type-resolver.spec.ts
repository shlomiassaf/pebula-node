// tslint:disable: max-classes-per-file
import { Schema } from 'mongoose';
import { GtColumn, GtSubDocument } from '../decorators';
import { GtResource } from '../model';
import { SchemaTestExplorer } from '../testing';
import { GtModelCompilationError } from '../errors';

enum TestEnumNum {
  a = 3,
  b = 5,
  c = 9,
}
enum TestEnumStr {
  a = '_a',
  b = '_b',
  c = '_c',
}
enum TestEnumMixed {
  a = 3,
  b = '_b',
  c = 9,
}

describe('goosetyped', () => {
  describe('Schema Builder', () => {
    describe('Column Type Logic', () => {
      it('should resolve primitive types', () => {

        class TestModel {
          @GtColumn()
          str: string;

          @GtColumn()
          num: number;

          @GtColumn()
          dt: Date;

          @GtColumn()
          bool: boolean;
        }

        const explorer = new SchemaTestExplorer(TestModel);

        explorer
          .column('str')
          .tsType(String).typeInSchema(Schema.Types.String)
          .dispose()
          .column('num')
          .tsType(Number).typeInSchema(Schema.Types.Number)
          .dispose()
          .column('dt')
          .tsType(Date).typeInSchema(Schema.Types.Date)
          .dispose()
          .column('bool')
          .tsType(Boolean).typeInSchema(Schema.Types.Boolean);
      });

      it('should resolve array', () => {

        class TestModel {
          @GtColumn({
            type: () => Date,
          })
          dt: Date[];
        }

        const explorer = new SchemaTestExplorer(TestModel);

        explorer
          .column('dt')
          .tsType(Date).typeInSchema([Schema.Types.Date])
          .dispose();
      });

      it('should throw if array does not have a type', () => {
        expect.assertions(4);

        try {
          @GtSubDocument()
          class TestModel extends GtResource() {
            @GtColumn()
            dt: Date[];
          }
        } catch (e) {
          const err = e as GtModelCompilationError;
          expect(err.modelName).toBe('TestModel');
          expect(err.connectionId).toBeUndefined();
          expect(err.message).toBe(`Error compiling model TestModel [Connection: Default]`);
          expect(err.internalError.message).toBe(`Invalid type configuration, container type requires an explicity type definition`);
        }
      });

      it('should resolve maps', () => {

        class TestModel {
          @GtColumn({
            type: () => Date,
          })
          dt: Map<string, Date>;
        }

        const explorer = new SchemaTestExplorer(TestModel);

        explorer
          .column('dt')
          .tsType(Date).schema({ type: Schema.Types.Map, of: Schema.Types.Date })
          .dispose();
      });

      it('should throw GtModelCompilationError if map does not have a type', () => {
        expect.assertions(4);

        try {
          @GtSubDocument()
          class TestModel extends GtResource() {
            @GtColumn()
            dt: Map<string, Date>;
          }
        } catch (e) {
          const err = e as GtModelCompilationError;
          expect(err.modelName).toBe('TestModel');
          expect(err.connectionId).toBeUndefined();
          expect(err.message).toBe(`Error compiling model TestModel [Connection: Default]`);
          expect(err.internalError.message).toBe(`Invalid type configuration, container type requires an explicity type definition`);
        }
      });

      it('should resolve ts enum object to string[]', () => {

        class TestModel {
          @GtColumn({
            enum: TestEnumNum,
          })
          numEnum: TestEnumNum;

          @GtColumn({
            enum: TestEnumStr,
          })
          strEnum: TestEnumStr;
        }

        const explorer = new SchemaTestExplorer(TestModel);

        explorer
          .column('numEnum')
          .hasOptionValue('enum', [3, 5, 9])
          .dispose()
          .column('strEnum')
          .hasOptionValue('enum', ['_a', '_b', '_c']);
      });

      it('should not resolve ts mixed enum object to string[]', () => {
        class TestModel {
          @GtColumn({
            enum: TestEnumMixed,
          })
          mixedEnum: TestEnumMixed;
        }

        const explorer = new SchemaTestExplorer(TestModel);

        explorer
          .column('mixedEnum')
          .hasOptionValue('enum', undefined);
      });
    });
  });
});
