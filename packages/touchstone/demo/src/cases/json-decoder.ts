import { Case } from '@pebula/touchstone';
import {
  objectDecoder,
  stringDecoder,
  numberDecoder,
  boolDecoder,
} from 'json-decoder';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const dataType = objectDecoder({
    number: numberDecoder,
    negNumber: numberDecoder,
    maxNumber: numberDecoder,
    string: stringDecoder,
    longString: stringDecoder,
    boolean: boolDecoder,
    deeplyNested: objectDecoder({
      foo: stringDecoder,
      num: numberDecoder,
      bool: boolDecoder,
    }),
  });
  
@RuntimeValidatorPackageSuite()
export class JsonDecoderPkg extends PackageCase {

  @Case({ name: 'json-decoder-sync' }) 
  validate() {
    const res = dataType.decode(this.data);

    if (res.type === 'ERR') {
      throw new Error(res.message);
    }

    return res.value;
  }

}
