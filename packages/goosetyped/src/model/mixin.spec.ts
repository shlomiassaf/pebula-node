import { Document, DocumentQuery, FilterQuery } from 'mongoose';
import { initMongoConnection } from '../../tests/utils';
import { GtVersionKey, GtIndex, GtTimestampCreated, GtTimestampUpdated, GtDocument, GtColumn, GtSaveHook } from '../decorators';
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

    class HookMixin {
      @GtColumn({ type: () => String })
      hookRun: string[];

      @GtSaveHook('pre')
      HookMixinPreSaveHook() {
        this.hookRun.push('HookMixinPreSaveHook');
        (this as any).name = 'Hooked';
      }
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

    it('should apply mixins with hooks', async () => {
      @GtDocument()
      class TestClass extends GtModel(HookMixin) {
        hookRun: string[] = [];
        @GtColumn() name: string;
      }
      let t = await TestClass.create({ name: 'test' });
      t = await TestClass.findById(t.id);
      expect(t.name).toBe('Hooked');
      expect(Array.from(t.hookRun)).toEqual(['HookMixinPreSaveHook']);
    });

    it('should apply mixins with hooks in proper order', async () => {
      class HookAdHocMixin {
        hookRun: string[];

        @GtSaveHook('pre')
        HookAdHocMixinPreSaveHook() {
          this.hookRun.push('HookAdHocMixinPreSaveHook');
        }
      }

      @GtDocument()
      class BaseBaseBaseBaseTestClass extends GtModel(HookMixin, HookAdHocMixin) {
        hookRun: string[] = [];

        @GtSaveHook('pre')
        BaseBaseBaseBaseTestClassPreSaveHook() {
          this.hookRun.push('BaseBaseBaseBaseTestClassPreSaveHook');
        }
      }

      class BaseBaseBaseTestClass extends BaseBaseBaseBaseTestClass {
        @GtSaveHook('pre')
        BaseBaseBaseTestClass() {
          this.hookRun.push('BaseBaseBaseTestClass');
        }
      }

      @GtDocument()
      class BaseBaseTestClass extends BaseBaseBaseTestClass {
        @GtSaveHook('pre')
        BaseBaseTestClass() {
          this.hookRun.push('BaseBaseTestClass');
        }
      }

      @GtDocument()
      class BaseTestClass extends BaseBaseTestClass {
        @GtColumn() name: string;

        @GtSaveHook('pre')
        BaseTestClass() {
          this.hookRun.push('BaseTestClass');
        }
      }

      @GtDocument()
      class TestClass extends BaseTestClass {
        @GtSaveHook('pre')
        TestClass() {
          this.hookRun.push('TestClass');
        }
      }

      let t = await TestClass.create({ name: 'test' });
      t = await TestClass.findById(t.id);
      expect(t.name).toBe('Hooked');
      expect(Array.from(t.hookRun)).toEqual([
        'TestClass',
        'BaseTestClass',
        'BaseBaseBaseTestClass',
        'BaseBaseTestClass',
        'HookAdHocMixinPreSaveHook',
        'HookMixinPreSaveHook',
        'BaseBaseBaseBaseTestClassPreSaveHook',
      ]);
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