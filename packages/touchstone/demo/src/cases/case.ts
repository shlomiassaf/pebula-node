import { Data } from '../data';

export interface Ctor<T> extends Function {
  new (...args: any[]): T;
}

export const ALL_RUNTIME_VALIDATION_SUITES: Array<Ctor<PackageCase>> = [];

export abstract class PackageCase {
  constructor(protected data: Data) {}

  validate(): Data { throw new Error('Not Implemented'); }
  async validateAsync(): Promise<Data> { throw new Error('Not Implemented'); };
}

export function RuntimeValidatorPackageSuite() {
  return (target: Ctor<PackageCase>) => {
    ALL_RUNTIME_VALIDATION_SUITES.push(target);
  }
}
