import * as yup from 'yup';
import { Case } from '@pebula/touchstone';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const dataType = yup.object({
  number: yup.number(),
  negNumber: yup.number(),
  maxNumber: yup.number(),
  string: yup.string(),
  longString: yup.string(),
  boolean: yup.bool().required(),
  deeplyNested: yup.object({
    foo: yup.string(),
    num: yup.number(),
    bool: yup.bool().required(),
  }),
});

@RuntimeValidatorPackageSuite()
export class YupPkg extends PackageCase {

  @Case({ name: 'yup-sync' }) 
  validate() {
    return dataType.validateSync(this.data, { recursive: true });
  }

  @Case({ name: 'yup-async' }) 
  async validateAsync() {
    return dataType.validate(this.data, { recursive: true });
  }
}
