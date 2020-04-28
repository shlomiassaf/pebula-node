import { GtModel, GtDocument, GtColumn, GtLocalProp } from '../..';

@GtDocument()
export class BaseTestingModel extends GtModel() {
  static INSTANCE_COUNTER = 1;

  @GtColumn()
  instanceId: number = (this.constructor as any).INSTANCE_COUNTER++;

  @GtLocalProp()
  localProp: string = String(Date.now());

  constructor(doc?: Partial<BaseTestingModel>) {
    super(doc);
  }
}

