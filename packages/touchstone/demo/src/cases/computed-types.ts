import { Case } from '@pebula/touchstone';
import Schema, { string, number, boolean } from 'computed-types';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const validator = Schema({
  number: number,
  negNumber: number.lt(0),
  maxNumber: number,
  string: string,
  longString: string,
  boolean: boolean,
  deeplyNested: {
    foo: string,
    num: number,
    bool: boolean,
  },
});

@RuntimeValidatorPackageSuite()
export class ComputedTypesPkg extends PackageCase {

  @Case({ name: 'computed-types-sync' }) 
  validate() {
    return validator(this.data);
  }
}
