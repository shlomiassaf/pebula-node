// tslint:disable: max-classes-per-file
import * as mongoose from 'mongoose';
import { GtColumn } from './column';
import {
  GtSkipVersioning,
  GtTimestampCreated,
  GtTimestampUpdated,
  GtVersionKey,
  GtToJSON,
  GtToObject,
} from './schema-options';
import { gtSchemaStore } from '../store';
import { GtDiscriminator } from './discriminator-type';

function getOptionValue<TOptKey extends keyof mongoose.SchemaOptions>(cls: any, key: TOptKey): mongoose.SchemaOptions[TOptKey] {
  return gtSchemaStore.get(cls).getSchemaOptions(key);
}

describe('goosetyped', () => {
  describe('decorators', () => {
    it('should register a `discriminatorKey` using GtDiscriminator', () => {
      class TestModel {
        @GtDiscriminator()
        myDiscriminatorKey: string;
      }

      expect(getOptionValue(TestModel, 'discriminatorKey')).toBe('myDiscriminatorKey');
    });

    it('should register a `skipVersioning` record using GtSkipVersioning', () => {
      class TestModel {
        @GtSkipVersioning()
        skip1: string;

        @GtSkipVersioning()
        skip2: string;

        @GtColumn()
        noSkip: string;
      }

      expect(getOptionValue(TestModel, 'skipVersioning')).toEqual({ skip1: true, skip2: true });
    });

    it('should register timestamps using GtTimestampCreated & GtTimestampUpdated', () => {
      class TestModel {
        @GtTimestampCreated()
        created: Date;
        @GtTimestampUpdated()
        updated: Date;
      }

      expect(getOptionValue(TestModel, 'timestamps')).toEqual({ createdAt: 'created', updatedAt: 'updated' });
    });

    it('should register a `versionKey` using GtVersionKey', () => {
      class TestModel0 {
        @GtColumn()
        myVersionKey: number;
      }
      expect(getOptionValue(TestModel0, 'versionKey')).toBe('__v');

      class TestModel {
        @GtVersionKey()
        myVersionKey: number;
      }
      expect(getOptionValue(TestModel, 'versionKey')).toBe('myVersionKey');
    });

    it('should register a toObject config & transform using GtToObject', () => {
      const metadata: mongoose.DocumentToObjectOptions = {
        virtuals: true,
        versionKey: false,
      };

      class TestModel {
        @GtToObject(metadata)
        toObjectTransform(ret: any, options: any): void {
          ret.self = this;
        }
      }

      const { transform, ...config } = getOptionValue(TestModel, 'toObject');
      expect(config).toEqual(metadata);

      const testModel = new TestModel();
      const retValue: any = {};
      const spy = jest.spyOn(testModel, 'toObjectTransform');
      transform(testModel, retValue, null);
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(retValue, null);
      expect(retValue.self).toBe(testModel);
    });

    it('should register a toJSON config & transform using GtToJSON', () => {
      const metadata: mongoose.DocumentToObjectOptions = {
        virtuals: true,
        versionKey: false,
      };

      class TestModel {
        @GtToJSON(metadata)
        toJSONTransform(ret: any, options: any): void {
          ret.self = this;
        }
      }

      const { transform, ...config } = getOptionValue(TestModel, 'toJSON');
      expect(config).toEqual(metadata);

      const testModel = new TestModel();
      const retValue: any = {};
      const spy = jest.spyOn(testModel, 'toJSONTransform');
      transform(testModel, retValue, null);
      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith(retValue, null);
      expect(retValue.self).toBe(testModel);
    });
  });
});
