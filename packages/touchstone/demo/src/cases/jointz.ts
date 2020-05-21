import jointz from 'jointz';
import { Case } from '@pebula/touchstone';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const dataType = jointz
  .object({
    number: jointz.number(),
    negNumber: jointz.number(),
    maxNumber: jointz.number(),
    string: jointz.string(),
    longString: jointz.string(),
    boolean: jointz.constant(true, false),
    deeplyNested: jointz
      .object({
        foo: jointz.string(),
        num: jointz.number(),
        bool: jointz.constant(true, false),
      })
      .requiredKeys('foo', 'num', 'bool'),
  })
  .requiredKeys([
    'number',
    'boolean',
    'deeplyNested',
    'longString',
    'maxNumber',
    'negNumber',
    'number',
    'string',
  ]);

@RuntimeValidatorPackageSuite()
export class JointzPkg extends PackageCase {

  @Case({ name: 'jointz-sync' }) 
  validate() {
    const { data } = this;

    if (dataType.isValid(data)) {
      return data;
    }

    throw dataType.validate(data);
  }

}
