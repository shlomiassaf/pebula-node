import { object, number, boolean, string } from '@ailabs/ts-utils/dist/decoder';
import { Case } from '@pebula/touchstone';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const dataType = object('Data', {
  number,
  negNumber: number,
  maxNumber: number,
  string,
  longString: string,
  boolean,
  deeplyNested: object('DeeplyNested', {
    foo: string,
    num: number,
    bool: boolean,
  }),
});

@RuntimeValidatorPackageSuite()
export class TsUtilsPkg extends PackageCase {

  @Case({ name: 'ts-utils-sync' }) 
  validate() {
    return dataType(this.data).toMaybe().value();
  }

  @Case({ name: 'ts-utils-async' }) 
  async validateAsync() {
    return dataType(this.data).toPromise();
  }
}
