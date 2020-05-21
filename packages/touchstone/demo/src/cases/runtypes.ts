import { Boolean, Number, String, Record } from 'runtypes';
import { Case } from '@pebula/touchstone';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const dataType = Record({
  number: Number,
  negNumber: Number,
  maxNumber: Number,
  string: String,
  longString: String,
  boolean: Boolean,
  deeplyNested: Record({
    foo: String,
    num: Number,
    bool: Boolean,
  }),
});

@RuntimeValidatorPackageSuite()
export class RuntypesPkg extends PackageCase {

  @Case({ name: 'runtypes-sync' }) 
  validate() {
    return dataType.check(this.data);
  }
}
