// tslint:disable: max-classes-per-file
import { GtDocumentMetadata, GtSubDocumentMetadata } from '../metadata';
import { GtDocument, GtSubDocument } from './schema';
import { GtModel, GtResource } from '../model';
import { gtSchemaStore } from '../store';

describe('goosetyped', () => {
  describe('decorators', () => {

    it('should register a sub document using GtSubDocument without metadata', () => {
      const spy = jest.spyOn(GtSubDocumentMetadata, 'setMetadata');

      @GtSubDocument()
      class TestModel extends GtResource() {
      }

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({}, { target: TestModel }, gtSchemaStore.get(TestModel));

      spy.mockClear();
    });

    it('should register a sub document using GtSubDocument', () => {
      const spy = jest.spyOn(GtSubDocumentMetadata, 'setMetadata');
      @GtSubDocument()
      class TestModel1 extends GtResource() {
      }

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({}, { target: TestModel1 }, gtSchemaStore.get(TestModel1));

      spy.mockClear();
    });

    it('should register a document using GtDocument without metadata', () => {
      const spy = jest.spyOn(GtDocumentMetadata, 'setMetadata');

      @GtDocument()
      class TestModel extends GtModel() {
      }

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith({}, { target: TestModel }, gtSchemaStore.get(TestModel));

      spy.mockClear();
    });

    it('should register a document using GtDocument', () => {
      const spy = jest.spyOn(GtDocumentMetadata, 'setMetadata');
      const metadata = {
        name: 'abcd',
        skipInit: true,
      };

      @GtDocument(metadata)
      class TestModel1 extends GtModel() {
      }

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(metadata, { target: TestModel1 }, gtSchemaStore.get(TestModel1));

      spy.mockClear();
    });
  });
});
