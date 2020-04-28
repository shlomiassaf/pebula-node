// tslint:disable: max-classes-per-file
import {
  GtDocument, GtModel,
  GtVersionKey,
  GtSubDocument, GtResource,
  GtColumn,
  GtDiscriminatorType,
  GtTimestampCreated,
  GtTimestampUpdated,
  GtDiscriminatorKey,
  GtIndex,
  GtLocalProp,
  GtToJSON,
  DocumentArray,
  GtInitHook, GtSaveHook,
} from '../..';

@GtSubDocument({ noId: true })
export class BaseComm extends GtResource() {

  @GtDiscriminatorKey()
  type: string;

  @GtTimestampCreated()
  @GtIndex({ sort: 'desc' })
  createDate: Date;

  @GtTimestampUpdated()
  @GtIndex({ sort: 'desc' })
  updateDate: Date;

  @GtLocalProp()
  token?: string = String(Date.now());
}

@GtSubDocument({ noId: true })
@GtDiscriminatorType()
export class EmailComm extends BaseComm {
  @GtColumn()
  email: string;

  constructor(doc?: Partial<EmailComm>) { super(doc); }
}

@GtSubDocument({ noId: true })
@GtDiscriminatorType()
export class PhoneComm extends BaseComm {
  @GtColumn()
  phone: string;

  constructor(doc?: Partial<PhoneComm>) {
    super(doc);
  }
}

@GtSubDocument({ noId: true })
@GtDiscriminatorType()
export class ResidenceComm extends BaseComm {
  @GtColumn({
    required: true,
  })
  street: string;
  @GtColumn()
  city: string;
  @GtColumn()
  zip: string;
  @GtColumn()
  country: string;

  constructor(doc?: Partial<ResidenceComm>) { super(doc); }
}
