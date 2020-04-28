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
import { OrderItem } from './order-item';
import { BasePaymentMethod } from './payment-methods';
import { Customer } from './customer';

export enum OrderStatusType {
  Pending,
  Created,
  Paid,
  Shipped,
  Closed,
}

@GtDocument()
export class Order extends BaseTestingModel {
  @GtColumn({
    enum: OrderStatusType,
  })
  status: OrderStatusType;

  @GtColumn({})
  customer: Customer;

  @GtColumn({
    type: () => OrderItem,
  })
  items: DocumentArray<OrderItem>;

  @GtColumn()
  payment: BasePaymentMethod;

  @GtColumn({
    type: () => String,
  })
  metadata: Map<string, string>;

  @GtTimestampCreated()
  @GtIndex({ sort: 'desc' })
  createDate: Date;

  @GtTimestampUpdated()
  @GtIndex({ sort: 'desc' })
  updateDate: Date;

  @GtVersionKey()
  version: number;

  constructor(doc?: Partial<Order>) { super(doc); }
}
