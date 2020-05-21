import { Case } from '@pebula/touchstone';
import { f, validatedPlainToClass } from '@marcj/marshal';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';
import { Data } from '../data';

type DeeplyNested = Data['deeplyNested'];

class DeeplyNestedType implements DeeplyNested {
  @f
  foo!: string;

  @f
  num!: number;

  @f
  bool!: boolean;
}

class DataType implements Data {
  @f
  number!: number;

  @f
  negNumber!: number;

  @f
  maxNumber!: number;

  @f
  string!: string;

  @f
  longString!: string;

  @f
  boolean!: boolean;

  @f.type(DeeplyNestedType)
  deeplyNested!: DeeplyNestedType;
}

@RuntimeValidatorPackageSuite()
export class MarshalPkg extends PackageCase {

  @Case({ name: 'marshal-sync' }) 
  validate() {
    return validatedPlainToClass(DataType, this.data);
  }
}
