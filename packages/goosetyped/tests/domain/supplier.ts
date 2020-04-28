// tslint:disable: max-classes-per-file
import {
  GtLocalProp,
  ObjectId,
  GtResource, GtModel,
  GtVersionKey,
  GtDocument, GtSubDocument,
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

export enum SupplierDeliveryType {
  Pickup,
  Post,
  InAddressAssembly,
}

@GtSubDocument({ noId: true })
export class SupplierInfoSubDocument extends GtResource() {

  @GtColumn({})
  someValue: string;

  @GtLocalProp()
  token?: string = String(Date.now());

  constructor(doc?: Partial<SupplierInfoSubDocument>) { super(doc); }
}

@GtDocument()
export class BaseSupplierInfo extends GtModel() {
  @GtDiscriminatorKey()
  kind: string;

  @GtColumn()
  supplierId: ObjectId;

  @GtColumn({})
  supplyDate: Date;

  @GtColumn()
  subDocument: SupplierInfoSubDocument;

  @GtLocalProp()
  token?: string = String(Date.now());

  @GtTimestampCreated()
  @GtIndex({ sort: 'desc' })
  createDate: Date;

  @GtTimestampUpdated()
  @GtIndex({ sort: 'desc' })
  updateDate: Date;
}

@GtDocument()
@GtDiscriminatorType()
export class PickupSupplierInfo extends BaseSupplierInfo {
  @GtColumn()
  pickupLocation: string;
}

@GtDocument()
@GtDiscriminatorType()
export class PostSupplierInfo extends BaseSupplierInfo {
  @GtColumn()
  postFee: string;
}

@GtDocument()
@GtDiscriminatorType()
export class AssembleSupplierInfo extends BaseSupplierInfo {
  @GtColumn()
  assembleFee: string;
}
