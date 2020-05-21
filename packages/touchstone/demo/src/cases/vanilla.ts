import { Case } from '@pebula/touchstone';
import { PackageCase, RuntimeValidatorPackageSuite } from './case';

@RuntimeValidatorPackageSuite()
export class VanillaPkg extends PackageCase {

  @Case({ name: 'vanilla-sync' }) 
  validate() {
    const value = this.data;
    if (value == null) return;
    if (!Number.isSafeInteger(value.number)) return;
    if (value.negNumber >= 0) return;
    if (value.maxNumber <= 0) return;
    if (typeof value.string !== 'string') return;
    if (typeof value.longString !== 'string') return;
    if (typeof value.boolean !== 'boolean') return;
    if (value.deeplyNested == null) return;
    if (typeof value.deeplyNested.foo !== 'string') return;
    if (typeof value.deeplyNested.num !== 'number') return;
    if (typeof value.deeplyNested.bool !== 'boolean') return;
    return value;
  }
}

