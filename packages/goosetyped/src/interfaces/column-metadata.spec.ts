// tslint:disable: max-classes-per-file
import * as mongoose from 'mongoose';
import { initMongoConnection } from '../../tests/utils';
import { GtColumn, GtDocument } from '../decorators';
import { GtModel } from '../model/mixin';

describe('goosetyped', () => {
  initMongoConnection('diff');

  describe('Columns', () => {
    it('should set the property to teh default value when it is defined', async () => {
      @GtDocument()
      class TestModel extends GtModel() {
        @GtColumn({ default: 'testing123' })
        public prop: string;
      }

      const doc = await TestModel.create({});
      expect(doc.prop).toBe('testing123');
    });

    it('should throw when a required field is missing', async () => {
      expect.assertions(1);

      @GtDocument()
      class TestModel extends GtModel() {
        @GtColumn({ required: true })
        public prop: string;
      }

      const doc = await TestModel.create({ prop: 'prop' });
      doc.prop = undefined;
      try {
        await doc.save();
      } catch (err) {
        expect(err.message).toBe('Validation failed: prop: Path `prop` is required.');
      }
    });

    it('should not update a property when it is defined as immutable', async () => {
      @GtDocument()
      class TestModel extends GtModel() {
        @GtColumn({ immutable: true })
        public prop: Readonly<string>;
      }

      const doc = await TestModel.create({ prop: 'prop' });
      expect(doc.prop).toBe('prop');
      doc.prop = 'revisedProp';
      expect(doc.prop).toBe('prop');
    });

    it('should validate', async () => {
      expect.assertions(1);

      @GtDocument()
      class TestModel extends GtModel() {
        @GtColumn({ validate: (value) => value > 5 })
        public prop: number;
      }

      const doc = await TestModel.create({ prop: 10 });
      doc.prop = 4;
      try {
        await doc.save();
      } catch (err) {
        expect(err.message).toBe('Validation failed: prop: Validator failed for path `prop` with value `4`');
      }
    });

    
  });
});
