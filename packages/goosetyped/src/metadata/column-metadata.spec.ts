// tslint:disable: max-classes-per-file
import { GtColumn, GtSkipVersioning } from '../decorators';
import { SchemaTestExplorer } from '../testing';

describe('goosetyped', () => {
  describe('Schema Builder', () => {

    it('should register a skipVersioning when set via options and via decorator', () => {

      class TestModel {
        @GtColumn({
          skipVersioning: true,
        })
        skipVersioningConfig: string;

        @GtSkipVersioning()
        @GtColumn()
        skipVersioningDirect: string;
      }

      const explorer = new SchemaTestExplorer(TestModel);

      explorer
        .hasColumn('skipVersioningConfig')
        .hasColumn('skipVersioningDirect')
        .hasOptionValue('skipVersioning', { skipVersioningConfig: true, skipVersioningDirect: true });

    });

    it('should register the default option', () => {
      class TestModel {
        @GtColumn({ default: 'abcd' })
        withDefault: string;
      }

      const explorer = new SchemaTestExplorer(TestModel);

      explorer
        .hasColumn('withDefault')
        .column('withDefault')
        .hasOptionValue('default', 'abcd');
    });

    it('should register the required option', () => {
      const required = () => true;
      class TestModel {
        @GtColumn({ required  })
        withRequired: string;
      }

      const explorer = new SchemaTestExplorer(TestModel);

      explorer
        .hasColumn('withRequired')
        .column('withRequired')
        .hasOptionValue('required', required);
    });

    it('should register the proper primitive types', () => {
      class TestModel {
        @GtColumn()
        bool: boolean;
        @GtColumn()
        text: string;
        @GtColumn()
        num: number;
        @GtColumn()
        date: Date;
      }

      const explorer = new SchemaTestExplorer(TestModel);

      explorer
        .column('bool').tsType(Boolean).dispose()
        .column('text').tsType(String).dispose()
        .column('num').tsType(Number).dispose()
        .column('date').tsType(Date).dispose();
    });
  });
});
