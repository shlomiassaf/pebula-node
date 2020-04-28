import * as mongoose from 'mongoose';
import {
  GtModel,
  GtVersionKey,
  GtDocument,
  GtColumn,
  GtDiscriminatorType,
  GtTimestampCreated,
  GtTimestampUpdated,
  GtDiscriminatorKey,
  GtIndex,
  GtToJSON,
  DocumentArray,
  GtInitHook, GtSaveHook,
} from '../..';
import { BaseTestingModel } from './base-testing.model';
import { BaseComm } from './comm';

export enum CustomerGenderType {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}

@GtDocument()
export class Customer extends BaseTestingModel {
  @GtColumn({})
  name: string;

  @GtColumn({})
  age: number;

  @GtColumn({
    enum: CustomerGenderType,
  })
  gender: CustomerGenderType;

  @GtTimestampCreated()
  @GtIndex({ sort: 'desc' })
  createDate: Date;

  @GtTimestampUpdated()
  @GtIndex({ sort: 'desc' })
  updateDate: Date;

  @GtVersionKey()
  version: number;

  @GtColumn({
    type: () => BaseComm,
  })
  communication: BaseComm[];

  constructor(doc?: Partial<Customer>) {
    super(doc);
  }

}
