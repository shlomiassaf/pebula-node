// tslint:disable: max-classes-per-file
import { initMongoConnection } from '../../tests/utils';
import { GtDocument, GtDiscriminator, GtColumn } from '../decorators';
import { GtModel } from '../model';
import { getDiscriminatorKeysOf, getDiscriminatorKeyFor, getEnum } from './helpers';

describe('goosetyped', () => {
  initMongoConnection('diff');

  describe('Store Helpers', () => {
    it('should return valid discriminator keys from getDiscriminatorKeysOf', () => {
      @GtDocument()
      class BaseModel extends GtModel() {
        @GtDiscriminator()
        kind: string;
      }

      @GtDocument()
      class P1Model extends BaseModel { }

      @GtDocument()
      class P2Model extends BaseModel { }

      let discriminators = getDiscriminatorKeysOf(BaseModel);
      expect(discriminators).toEqual(['P1Model', 'P2Model']);

      discriminators = getDiscriminatorKeysOf(P1Model);
      expect(discriminators).toEqual(['P1Model', 'P2Model']);

      discriminators = getDiscriminatorKeysOf(class X {});
      expect(discriminators).toEqual([]);
    });

    it('should return valid discriminator key from getDiscriminatorKeyFor', () => {
      @GtDocument()
      class BaseModel extends GtModel() {
        @GtDiscriminator()
        kind: string;
      }

      @GtDocument()
      class P1Model extends BaseModel { }

      @GtDocument()
      class P2Model extends BaseModel { }

      expect(getDiscriminatorKeyFor(P1Model)).toEqual('P1Model');
      expect(getDiscriminatorKeyFor(P2Model)).toEqual('P2Model');
      expect(getDiscriminatorKeyFor(BaseModel)).toBeUndefined();
      expect(getDiscriminatorKeyFor(class X {})).toBeUndefined();

    });

    it('should return enums', async () => {

      const stringArrayEnum =  [ 'a', 'b', 'c' ];
      const numberArrayEnum =  [ 99, 98, 97 ];

      enum TestNumericEnum {
        a = 15,
        b = 25,
        c = 35,
      }
      enum TestStringEnum {
        a = 'x',
        b = 'y',
        c = 'z',
      }

      @GtDocument()
      class TestModel extends GtModel() {

        @GtColumn({
          enum: stringArrayEnum,
        })
        strArrayEnum: string;

        @GtColumn({
          enum: numberArrayEnum,
        })
        numArrayEnum: number;

        @GtColumn({
          enum: TestNumericEnum,
        })
        numEnum: TestNumericEnum;

        @GtColumn({
          enum: TestStringEnum,
        })
        strEnum: TestStringEnum;
      }

      expect(getEnum(TestModel, 'strArrayEnum')).toEqual(stringArrayEnum);
      expect(getEnum(TestModel, 'numArrayEnum')).toEqual(numberArrayEnum);
      expect(getEnum(TestModel, 'numEnum')).toEqual([15, 25, 35]);
      expect(getEnum(TestModel, 'strEnum')).toEqual([ 'x', 'y', 'z']);
    });
  });
});
