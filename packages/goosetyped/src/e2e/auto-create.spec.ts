import { Document, DocumentQuery, FilterQuery, Connection } from 'mongoose';
import { createMongoConnection } from '../../tests/utils';
import { GtVersionKey, GtIndex, GtTimestampCreated, GtTimestampUpdated, GtDocument, GtColumn } from '../decorators';
import { GtModel } from '../model';

describe('goosetyped-e2e', () => {

  describe('auto-create', () => {

    it('should create collection and indexes', async () => {
      let connection = await createMongoConnection();
      try {
        await connection.db.dropCollection('testclasses');
      } catch (err) {
      }
      await connection.close();

      connection = await createMongoConnection();
      try {
        await connection.db.collection('testclasses', { strict: true });
        throw new Error('Collection should not exist');
      } catch (err) {
      }
      await connection.close();

      const run = async () => {
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

        expect(TestClass['$init']).toBeInstanceOf(Promise);

        connection = await createMongoConnection();
        await TestClass.init();

        const collection = await connection.db.collection(TestClass.collection.collectionName);
        expect(collection).toBeDefined();

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
      }

      await run();
      await connection.db.dropCollection('testclasses');
      await connection.close();
    });
});
});