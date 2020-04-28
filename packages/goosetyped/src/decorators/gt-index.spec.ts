// tslint:disable: max-classes-per-file
import { GtIndexMetadata } from '../metadata';
import { GtIndex } from './gt-index';
import { metadataDecoratorSpy } from '../testing';

describe('goosetyped', () => {
  describe('decorators', () => {
    let spyStuff: ReturnType<typeof metadataDecoratorSpy>;

    beforeEach(() => {
      spyStuff = metadataDecoratorSpy(GtIndexMetadata);
    });

    afterEach(() => {
      spyStuff.spy.mockClear();
    });

    it('should register a compound column index using GtIndex with metadata', () => {
      const metadata = {
        indices: {
          column1: 'asc' as 'asc',
          column2: 'desc' as 'desc',
        },
      };

      @GtIndex(metadata)
      class TestModel {
        column: string;
      }

      expect(spyStuff.spy).toBeCalledTimes(1);
      expect(spyStuff.catcher.options).toBe(metadata);
      expect(spyStuff.catcher.target).toBe(TestModel);
    });

    it('should register a single column index using GtIndex with metadata', () => {
      const metadata = { sort: 'asc' as 'asc' };
      class TestModel {
        @GtIndex(metadata)
        column: string;
      }

      expect(spyStuff.spy).toBeCalledTimes(1);
      expect(spyStuff.catcher.options).toBe(metadata);
      expect(spyStuff.catcher.key).toBe('column');
      expect(spyStuff.catcher.target).toBe(TestModel.prototype);
    });
  });
});
