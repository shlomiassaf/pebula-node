import * as t from 'io-ts';
import { Case } from '@pebula/touchstone';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const dataType = t.type({
  number: t.Int,
  negNumber: t.number,
  maxNumber: t.number,
  string: t.string,
  longString: t.string,
  boolean: t.boolean,
  deeplyNested: t.type({
    foo: t.string,
    num: t.number,
    bool: t.boolean,
  }),
});

@RuntimeValidatorPackageSuite()
export class IoTsPkg extends PackageCase {

  @Case({ name: 'io-ts-sync' }) 
  validate() {
    const { data } = this;

    if (dataType.is(data)) {
      return data;
    }

    throw new Error('Invalid');
  }
}
