// tslint:disable: max-classes-per-file
import { GtPluginMetadata } from '../metadata';
import { GtPlugin } from './plugin';
import { metadataDecoratorSpy } from '../testing';

describe('goosetyped', () => {
  describe('decorators', () => {
    let spyStuff: ReturnType<typeof metadataDecoratorSpy>;

    beforeEach(() => {
      spyStuff = metadataDecoratorSpy(GtPluginMetadata);
    });

    afterEach(() => {
      spyStuff.spy.mockClear();
    });

    it('should register a plugin using GtPlugin', () => {
      const metadata = {
        plugin: (s) => {},
      };
      @GtPlugin(metadata)
      class TestModel {
      }

      expect(spyStuff.spy).toBeCalledTimes(1);
      expect(spyStuff.catcher.options).toBe(metadata);
      expect(spyStuff.catcher.key).toBeUndefined();
      expect(spyStuff.catcher.target).toBe(TestModel);
    });
  });
});
