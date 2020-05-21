import * as z from 'zod';
import { Case } from '@pebula/touchstone';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

const dataType = z.object({
  number: z.number(),
  negNumber: z.number(),
  maxNumber: z.number(),
  string: z.string(),
  longString: z.string(),
  boolean: z.boolean(),
  deeplyNested: z.object({
    foo: z.string(),
    num: z.number(),
    bool: z.boolean(),
  }),
});

@RuntimeValidatorPackageSuite()
export class ZodPkg extends PackageCase {

  @Case({ name: 'zod-sync' }) 
  validate() {
    return dataType.parse(this.data) as any;
  }
}
