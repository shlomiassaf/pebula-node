// tslint:disable: max-classes-per-file
import {
  GtLocalProp,
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

@GtSubDocument({ noId: true })
export class CreditCardPaymentMethodExpire extends GtResource() {
  @GtColumn()
  month: number;
  @GtColumn()
  year: number;

  @GtLocalProp()
  token?: string = String(Date.now());

  constructor(doc?: Partial<CreditCardPaymentMethodExpire>) { super(doc); }
}

@GtDocument()
export class BasePaymentMethod extends GtModel() {

  @GtDiscriminatorKey()
  kind: string;

  @GtTimestampCreated()
  @GtIndex({ sort: 'desc' })
  createDate: Date;

  @GtTimestampUpdated()
  @GtIndex({ sort: 'desc' })
  updateDate: Date;

}

@GtDocument()
@GtDiscriminatorType()
export class CreditCardPaymentMethod extends BasePaymentMethod {

  @GtColumn()
  holderName: string;

  @GtColumn({
    required: true,
  })
  ccNumber: string;

  @GtColumn()
  expired: CreditCardPaymentMethodExpire;

  constructor(doc?: Partial<CreditCardPaymentMethod>) {
    super(doc);
  }
}

@GtDocument()
@GtDiscriminatorType()
export class ChequePaymentMethod extends BasePaymentMethod {
  @GtColumn()
  serial: string;

  @GtColumn()
  toDate: Date;

  constructor(doc?: Partial<ChequePaymentMethod>) { super(doc); }
}

@GtDocument()
@GtDiscriminatorType()
export class StoreCreditPaymentMethod extends BasePaymentMethod {
  @GtColumn()
  serial: string;

  constructor(doc?: Partial<StoreCreditPaymentMethod>) { super(doc); }
}
