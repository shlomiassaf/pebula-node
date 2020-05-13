// tslint:disable: max-classes-per-file
import { GtDiscriminator } from './discriminator-type';
import { GtModel } from '../model/mixin';
import { GtDocument } from './schema';
import { GtColumn } from './column';

describe('goosetyped', () => {
  describe('decorators', () => {

    it('should not fail if type if missing', () => {
      const createModel = () => {
        interface X {}
        @GtDocument()
        class TestModel<T extends keyof X = keyof X> extends GtModel() {
          @GtColumn()
          value: string;

          @GtDiscriminator()
          kind: T;
        }
        
        @GtDocument()
        class TestModel1 extends TestModel {
          @GtColumn()
          rate: number;
        }
      };
      expect(createModel).not.toThrow();
    });

  });
});
