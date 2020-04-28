// tslint:disable: max-classes-per-file
import mongoose from 'mongoose';
import { GtDocument, GtColumn } from '../decorators';
import { GtModel } from '../model';
import { SchemaTestExplorer } from '../testing';
import { initMongoConnection } from '../../tests/utils';
import { addConnection } from './add-connection';
import { GtModelCompilationError } from '../errors/model-compilation-error';
import { getSchemaOf } from '../store/helpers';

describe('goosetyped', () => {
  describe('Deffered Model Compilation / Connections', () => {
    initMongoConnection('diff');

    it('should compile default connection models immediately', () => {
      @GtDocument()
      class TestModel extends GtModel() {
        @GtColumn()
        dt: Date;
      }

      const explorer = new SchemaTestExplorer(TestModel, false);
      explorer.hasColumn('dt');
      expect(mongoose.models[explorer.container.getName()]).toBeDefined();
    });

    it('should not compile unique connection models immediately', async () => {
      jest.useFakeTimers();

      @GtDocument({
        connectionId: 'testConnection',
      })
      class TestModel extends GtModel() {
        @GtColumn()
        dt: Date;
      }

      jest.advanceTimersByTime(100);

      let explorer = new SchemaTestExplorer(TestModel, false);
      explorer.hasColumn('dt', true);
      expect(mongoose.models['TestModel']).toBeUndefined();

      const connection = mongoose.createConnection(process.env.MONGO_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
      const addConnectionPromise = addConnection('testConnection', () => connection );

      explorer = new SchemaTestExplorer(TestModel, false);
      explorer.hasColumn('dt', true);
      expect(mongoose.models['TestModel']).toBeUndefined();

      await addConnectionPromise;

      explorer = new SchemaTestExplorer(TestModel, false);
      explorer.hasColumn('dt');
      expect(mongoose.model(explorer.container.getName())).toBeDefined();

      connection.close();
    });

    it('should throw an error throw the error handler on deffered model compilation', async () => {
      expect.assertions(4);
      const connection = mongoose.createConnection(process.env.MONGO_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

      try {
        @GtDocument({
          connectionId: 'testConnection',
        })
        class TestModel extends GtModel() {
          @GtColumn()
          dt: Date[];
        }

        await addConnection('testConnection', () => connection );
      } catch (e) {
        const err = e as GtModelCompilationError;
        expect(err.modelName).toBe('TestModel');
        expect(err.connectionId).toBe('testConnection');
        expect(err.message).toBe(`Error compiling model ${err.modelName} [Connection: ${err.connectionId || 'Default'}]`);
        expect(err.internalError.message).toBe(`Invalid type configuration, container type requires an explicity type definition`);
      }

      connection.close();
    });

    it('should execute beforeCompile if it was set', async () => {
      jest.useFakeTimers();

      @GtDocument({
        connectionId: 'testConnection2',
      })
      class TestModel extends GtModel() {
        @GtColumn()
        dt: Date;
      }

      jest.advanceTimersByTime(100);

      let t, s;
      const beforeCompile = ({ target, schema }) => {
        t = target;
        s = schema;
        schema.add({
          ['dt1']: Date,
        })
      };
      const connection = mongoose.createConnection(process.env.MONGO_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
      const addConnectionPromise = addConnection('testConnection2', () => connection, { beforeCompile } );

      await addConnectionPromise;

      const explorer = new SchemaTestExplorer(TestModel, false);
      explorer.hasColumn('dt');
      explorer.hasColumn('dt1' as any);
      expect(t).toBe(TestModel);
      expect(s).toBe(getSchemaOf(TestModel));
  
      connection.close();        
    });

  });
});
