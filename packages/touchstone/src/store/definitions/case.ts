import { MethodDecoratorArgs } from '../../utils';
import { Decorator } from '../../decoration';
import { Case, CaseMetadataArgs } from '../../decorators/case';
import { MetadataInfo } from '../suite-definition-container';
import { isAsyncMethod } from '../utils';

export interface CaseInfo {
  proto: object;
  key: string | symbol;
  method: (...args: any) => any;
  metadata: CaseMetadataArgs;
  isPromise: boolean;
}

function createCaseInfo(rawInfo: MetadataInfo<CaseMetadataArgs>): CaseInfo {
  const { target, key, descriptor } = (rawInfo.decoratorArgs as MethodDecoratorArgs);
  return {
    proto: target,
    key,
    method: descriptor.value,
    metadata: rawInfo.metadata,
    isPromise: isAsyncMethod(target, key),
  };
}

export function createCases(metadata: Map<Decorator<any>, MetadataInfo[]>) {
  const rawCases: Array<MetadataInfo<CaseMetadataArgs>> = metadata.get(Case) || [];
  const cases = new Map<string, CaseInfo>()

  for (const c of rawCases) {
    cases.set(c.metadata.name, createCaseInfo(c));
  }

  return cases;
}
