// tslint:disable: max-classes-per-file
import { GtMethodMetadata } from '../metadata';
import { GtMethod } from './method';
import { metadataDecoratorSpy } from '../testing';
import { getSchemaOf } from '../store/helpers';

describe('goosetyped', () => {
  describe('decorators', () => {
    let spyStuff: ReturnType<typeof metadataDecoratorSpy>;

    beforeEach(() => {
      spyStuff = metadataDecoratorSpy(GtMethodMetadata);
    });

    afterEach(() => {
      spyStuff.spy.mockClear();
    });

    it('should register a static method using GtMethod', () => {
      class TestModel {
        @GtMethod()
        static method() { return; }
      }

      expect(spyStuff.spy).toBeCalledTimes(1);
      expect(spyStuff.catcher.options).toEqual(null);
      expect(spyStuff.catcher.key).toBe('method');
      expect(spyStuff.catcher.target).toBe(TestModel);
    });

    it('should register an instance method using GtMethod', () => {
      class TestModel {
        @GtMethod()
        method() { return; }
      }

      expect(spyStuff.spy).toBeCalledTimes(1);
      expect(spyStuff.catcher.options).toEqual(null);
      expect(spyStuff.catcher.key).toBe('method');
      expect(spyStuff.catcher.target).toBe(TestModel.prototype);
    });
  });
});
