import { Document, DocumentQuery, FilterQuery, Connection } from 'mongoose';
import { createMongoConnection } from '../../tests/utils';
import { GtVersionKey, GtIndex, GtTimestampCreated, GtTimestampUpdated, GtDocument, GtColumn } from '../decorators';
import { GtModel } from '../model';

describe('goosetyped-e2e', () => {
  let connection: Connection;

  beforeAll(async () => {
    connection = await createMongoConnection();
  });

  describe('e2e sanity', () => {

    @GtDocument()
    class TestClass extends GtModel() {

      @GtIndex({ sort: 'asc', options: { background: false } })
      @GtColumn() name: string;

      @GtVersionKey()
      version: number;

      @GtTimestampCreated()
      @GtIndex({ sort: 'desc', options: { background: false } })
      createDate: Date;

      @GtTimestampUpdated()
      @GtIndex({ sort: 'desc', options: { background: false } })
      updateDate: Date;

      @GtColumn() owner: string;
    }

    it('should create the collection', async () => {
      const collection = await TestClass.db.collection(TestClass.collection.collectionName);
      expect(collection).toBeDefined();
    });

  
    it('should create indexes for the collection', async () => {
      await TestClass.init();
      const indexInfo = await TestClass.collection.indexInformation();
      const indexes: Array<[string, -1 | 1]> = Object.values(indexInfo);

      expect(indexes.length).toBe(4);

      const expectedIndexes = [
        [['_id', 1]],
        [['name', 1]],
        [['createDate', -1]],
        [['updateDate', -1]],
      ];
      expect(expectedIndexes).toEqual(indexes);
    });

    it('should apply mixins', async () => {
      // let t = await TestClass.create({ name: 'test', owner: 'tester' });
      // t = await TestClass.findById(t.id);
      // expect(t.createDate).toBeInstanceOf(Date);
      // expect(t.updateDate).toBeInstanceOf(Date);
      // expect(t.name).toBe('test');
      // expect(t.owner).toBe('tester');
    });

  });
});