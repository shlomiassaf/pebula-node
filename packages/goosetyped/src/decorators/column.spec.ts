// tslint:disable: max-classes-per-file
import { GtColumnMetadata } from '../metadata';
import { GtColumn } from './column';
import { metadataDecoratorSpy } from '../testing';

describe('goosetyped', () => {
  describe('decorators', () => {
    let spyStuff: ReturnType<typeof metadataDecoratorSpy>;

    beforeEach(() => {
      spyStuff = metadataDecoratorSpy(GtColumnMetadata);
    });

    afterEach(() => {
      spyStuff.spy.mockClear();
    });

    it('should register a column using GtColumn without metadata', () => {
      class TestModel {
        @GtColumn()
        column: string;
      }

      expect(spyStuff.spy).toBeCalledTimes(1);
      expect(spyStuff.catcher.options).toEqual({});
      expect(spyStuff.catcher.key).toBe('column');
      expect(spyStuff.catcher.target).toBe(TestModel.prototype);
    });

    it('should register a column using GtColumn with metadata', () => {
      const metadata = { skipVersioning: true, default: 'abcd' };
      class TestModel {
        @GtColumn(metadata)
        column: string;
      }

      expect(spyStuff.spy).toBeCalledTimes(1);
      expect(spyStuff.catcher.options).toBe(metadata);
      expect(spyStuff.catcher.key).toBe('column');
      expect(spyStuff.catcher.target).toBe(TestModel.prototype);
    });
  });
});
