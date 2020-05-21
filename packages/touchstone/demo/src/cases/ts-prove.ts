import P, { isProved } from 'ts-prove';
import { Case } from '@pebula/touchstone';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const proveData = P.shape({
  number: P.number,
  negNumber: P.number,
  maxNumber: P.number,
  string: P.string,
  longString: P.string,
  boolean: P.boolean,
  deeplyNested: P.shape({
    foo: P.string,
    num: P.number,
    bool: P.boolean,
  }),
});

@RuntimeValidatorPackageSuite()
export class TsProvePkg extends PackageCase {

  @Case({ name: 'ts-prove-sync' }) 
  validate() {
    const { data } = this;
    const res = proveData(data);

    if (isProved(res)) {
      return data;
    }
  }
}
