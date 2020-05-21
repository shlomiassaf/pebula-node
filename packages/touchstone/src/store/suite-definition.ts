import { Cls, Ctor, getInheritanceChain } from '../utils';
import { Decorator } from '../decoration';
import { MetadataInfo, decoratorStore } from './suite-definition-container';
import {
  SuiteInfo, createSuite,
  CaseInfo, createCases,
  LifeCycleMethodInfo, createLifeCycleMethods,
} from './definitions';

export interface SuiteDefinitions {
  target: Cls<any>,
  suite: SuiteInfo | undefined;
  cases: Map<string, CaseInfo>;
  lifeCycle: LifeCycleMethodInfo;
}

export function createSuiteDefinitions(target: Cls<any>, metadata: Map<Decorator<any>, MetadataInfo[]>): SuiteDefinitions {
  const inheritanceChain = getInheritanceChain(target, true);

  for (const baseTarget of inheritanceChain) {
    const baseContainer = decoratorStore.getTarget(baseTarget);
    if (baseContainer) {
      baseContainer.extendDecoratorMetadata(decoratorStore, target);
    }
  }

  const suite = createSuite(metadata);
  const suiteDefinitions: SuiteDefinitions = {
    target,
    suite,
    cases: createCases(metadata),
    lifeCycle: createLifeCycleMethods(metadata, 'all'),
  };

  return suiteDefinitions;
}