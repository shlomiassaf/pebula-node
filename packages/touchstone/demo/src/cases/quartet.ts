import { v } from 'quartet';
import { Case } from '@pebula/touchstone';
import { Data } from '../data';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const checkData = v<Data>({
  number: v.safeInteger,
  negNumber: v.negative,
  maxNumber: v.positive,
  string: v.string,
  longString: v.and(v.string, v.minLength(100)),
  boolean: v.boolean,
  deeplyNested: {
    foo: v.string,
    num: v.number,
    bool: v.boolean,
  },
});

@RuntimeValidatorPackageSuite()
export class QuartetPkg extends PackageCase {

  @Case({ name: 'quartet-sync' }) 
  validate() {
    const { data } = this;

    if (checkData(data)) {
      return data;
    }

    throw new Error('Invalid');
  }
}
