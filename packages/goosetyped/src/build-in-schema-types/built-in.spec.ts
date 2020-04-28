// tslint:disable: max-classes-per-file
import { GtColumn, GtDocument } from '../decorators';
import { SchemaTestExplorer } from '../testing';
import { GtModel } from '../model';
import { getSchemaOf } from '../store';
import { GtSubDocument } from '../decorators/schema';
import { GtResource } from '../model/mixin';
import { DocumentArray } from './built-in';
import { GtModelCompilationError } from '../errors';

describe('goosetyped', () => {
  describe('Schema Builder', () => {
    describe('Column Type Logic', () => {
      it('should resolve DocumentArray', () => {

        @GtDocument()
        class TestSubDoc extends GtModel() {
          @GtColumn()
          name: string;
        }

        class TestModel {
          @GtColumn({
            type: () => TestSubDoc,
          })
          subDocs: DocumentArray<TestSubDoc>;
        }

        const explorer = new SchemaTestExplorer(TestModel);

        explorer
          .column('subDocs')
          .tsType(TestSubDoc).typeInSchema([getSchemaOf(TestSubDoc)])
          .dispose();
      });

      it('should throw if DocumentArray does not have a type', () => {
        expect.assertions(4);

        try {
          @GtSubDocument()
          class TestModel extends GtResource() {
            @GtColumn()
            dt: DocumentArray<any>;
          }
        } catch (e) {
          const err = e as GtModelCompilationError;
          expect(err.modelName).toBe('TestModel');
          expect(err.connectionId).toBeUndefined();
          expect(err.message).toBe(`Error compiling model TestModel [Connection: Default]`);
          expect(err.internalError.message).toBe(`Invalid type configuration, container type requires an explicity type definition`);
        }
      });
    });
  });
});
