import myzod from 'myzod';
import { Case } from '@pebula/touchstone';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const dataType = myzod.object({
  number: myzod.number(),
  negNumber: myzod.number(),
  maxNumber: myzod.number(),
  string: myzod.string(),
  longString: myzod.string(),
  boolean: myzod.boolean(),
  deeplyNested: myzod.object({
    foo: myzod.string(),
    num: myzod.number(),
    bool: myzod.boolean(),
  }),
});

@RuntimeValidatorPackageSuite()
export class MyzodPkg extends PackageCase {

  @Case({ name: 'myzod-sync' }) 
  validate() {
    return dataType.parse(this.data) as any;
  }
}
