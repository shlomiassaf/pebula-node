import { initMongoConnection } from '../../../tests/utils';
import { GtDocument, GtColumn, GtSaveHook, GtInitHook } from '../';
import { GtModel } from '../../model/mixin';

describe('goosetyped', () => {
  initMongoConnection('diff');

  describe('Hooks - document', () => {

    it('should apply init hooks', async () => {

      @GtDocument()
      class TestClass extends GtModel() {
        @GtColumn() name: string;
        hidden: string;

        whatWasName: string;
        whatWasHidden: string;
        
        @GtInitHook('pre')
        myPreHook() {
          this.name = 'Hooked';
          this.whatWasHidden = this.hidden;
        }

        @GtInitHook('post')
        myPostHook() {
          this.hidden = 'testHidden';
          this.whatWasName = this.name;
        }

      }

      let t = new TestClass();
      t.init({} as any);
      expect(t.name).toBe('Hooked');
      expect(t.hidden).toBe('testHidden');
      expect(t.whatWasHidden).toBeUndefined();
      expect(t.whatWasName).toBe(t.name);
    });

    it('should apply save hooks', async () => {

      @GtDocument()
      class TestClass extends GtModel() {
        @GtColumn() name: string;

        hidden: string;

        @GtSaveHook('pre')
        myPreHook() {
          this.name = 'Hooked';
        }

        @GtSaveHook('post')
        myPostHook() {
          this.hidden = 'testHidden';
        }

      }

      let t = await TestClass.create({ name: 'test' });
      expect(t.name).toBe('Hooked');
      expect(t.hidden).toBe('testHidden');

      t = await TestClass.findById(t.id);
      expect(t.name).toBe('Hooked');
      expect(t.hidden).toBeUndefined();
    });    

    // TODO: more tests
  });
});