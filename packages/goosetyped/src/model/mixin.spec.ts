import { Document, DocumentQuery, FilterQuery } from 'mongoose';
import { initMongoConnection } from '../../tests/utils';
import { GtVersionKey, GtIndex, GtTimestampCreated, GtTimestampUpdated, GtDocument, GtColumn } from '../decorators';
import { GtModel, GtQuery } from './mixin';

describe('goosetyped', () => {
  initMongoConnection('diff');

  describe('mixins', () => {


    class VersionMixin {
      @GtVersionKey()
      version: number;
    }

    class TimestampMixin {
      @GtTimestampCreated()
      @GtIndex({ sort: 'desc' })
      createDate: Date;
    
      @GtTimestampUpdated()
      @GtIndex({ sort: 'desc' })
      updateDate: Date;
    }

    class OwnerMixin {
      @GtColumn() owner: string;
    }

    it('should apply mixins', async () => {
      @GtDocument()
      class TestClass extends GtModel(TimestampMixin, VersionMixin, OwnerMixin) {
        @GtColumn() name: string;
      }
      let t = await TestClass.create({ name: 'test', owner: 'tester' });
      t = await TestClass.findById(t.id);
      expect(t.createDate).toBeInstanceOf(Date);
      expect(t.updateDate).toBeInstanceOf(Date);
      expect(t.name).toBe('test');
      expect(t.owner).toBe('tester');
    });

    it('should apply query helper mixins', async () => {
      class QHelper {
        nameWithT<T extends Document & { name: string }>(this: DocumentQuery<T[], T, QHelper> & QHelper): DocumentQuery<T[], T, QHelper> & QHelper {
          return this.find({ name: /^t.+/ } as FilterQuery<T>);
        }

        ownerEndWithNum<T extends Document & { owner: string }>(this: DocumentQuery<T[], T, QHelper> & QHelper): DocumentQuery<T[], T, QHelper> & QHelper {
          return this.find({ owner: /\d$/ } as FilterQuery<T>);
        }
      }

      @GtDocument()
      class TestClass extends GtQuery(QHelper)(GtModel(TimestampMixin, VersionMixin, OwnerMixin)) {
        @GtColumn() name: string;
      }

      await TestClass.deleteMany({});
      await TestClass.create({ name: 'test', owner: 'a' });
      await TestClass.create({ name: 'test-a', owner: 'b' });
      await TestClass.create({ name: 'test-b', owner: 'c1' });
      await TestClass.create({ name: 'noTest', owner: 'd2' });
      await TestClass.create({ name: 'best1', owner: 'e' });
      await TestClass.create({ name: 'best2', owner: 'f' });
      let results = await TestClass.find().nameWithT();
      expect(results.length).toBe(3);

      results = await TestClass.find().ownerEndWithNum()
      expect(results.length).toBe(2);


      results = await TestClass.find().nameWithT().ownerEndWithNum();
      results = await TestClass.find().ownerEndWithNum().nameWithT();
      expect(results.length).toBe(1);
    });

  });
});