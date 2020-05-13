// tslint:disable: max-classes-per-file
import {
  GtLocalProp,
  ObjectId,
  GtResource, GtModel,
  GtVersionKey,
  GtDocument, GtSubDocument,
  GtColumn,
  GtDiscriminator,
  GtTimestampCreated,
  GtTimestampUpdated,
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
  @GtDiscriminator()
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
export class PickupSupplierInfo extends BaseSupplierInfo {
  @GtColumn()
  pickupLocation: string;
}

@GtDocument()
export class PostSupplierInfo extends BaseSupplierInfo {
  @GtColumn()
  postFee: string;
}

@GtDocument()
export class AssembleSupplierInfo extends BaseSupplierInfo {
  @GtColumn()
  assembleFee: string;
}
