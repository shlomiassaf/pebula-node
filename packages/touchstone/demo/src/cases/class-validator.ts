import 'reflect-metadata';
import { Case } from '@pebula/touchstone';
import { Type } from 'class-transformer';
import { IsNegative, ValidateNested, IsBoolean, IsNumber, IsString } from 'class-validator'
import { transformAndValidate, transformAndValidateSync } from 'class-transformer-validator';
import { Data } from '../data';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

type DeeplyNested = Data['deeplyNested'];

class DeeplyNestedType implements DeeplyNested {
  @IsString()
  foo!: string;

  @IsNumber()
  num!: number;

  @IsBoolean()
  bool!: boolean;
}

class DataType implements Data {
  @IsNumber()
  number!: number;

  @IsNegative()
  negNumber!: number;

  @IsNumber()
  maxNumber!: number;

  @IsString()
  string!: string;

  @IsString()
  longString!: string;

  @IsBoolean()
  boolean!: boolean;

  @ValidateNested()
  @Type(() => DeeplyNestedType)
  deeplyNested!: DeeplyNestedType;
}

@RuntimeValidatorPackageSuite()
export class ClassValidatorPkg extends PackageCase {

  @Case({ name: 'class-transformer-validator-sync' }) 
  validate() {
    return transformAndValidateSync(DataType, this.data);
  }

  @Case({ name: 'class-transformer-validator-async' }) 
  async validateAsync() {
    return transformAndValidate(DataType, this.data);
  }
}
