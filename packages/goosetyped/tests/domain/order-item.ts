import {
  GtModel,
  GtVersionKey,
  GtDocument,
  GtColumn,
  GtDiscriminator,
  GtTimestampCreated,
  GtTimestampUpdated,
  GtIndex,
  GtToJSON,
  DocumentArray,
  GtInitHook, GtSaveHook,
} from '../..';
import { BaseTestingModel } from './base-testing.model';
import { BaseSupplierInfo } from './supplier';

@GtDocument()
export class OrderItem extends BaseTestingModel {

  @GtIndex({ sort: 'asc' })
  @GtColumn()
  sku: string;

  @GtColumn()
  name: string;

  @GtColumn()
  quantity: number;

  @GtTimestampCreated()
  @GtIndex({ sort: 'desc' })
  createDate: Date;

  @GtColumn()
  supplier: BaseSupplierInfo;

  @GtTimestampUpdated()
  @GtIndex({ sort: 'desc' })
  updateDate: Date;

  @GtVersionKey()
  version: number;

  constructor(doc?: Partial<OrderItem>) { super(doc); }
}
