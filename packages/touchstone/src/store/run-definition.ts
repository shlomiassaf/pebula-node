import { Cls, getInheritanceChain } from '../utils';
import { Decorator } from '../decoration';
import { MetadataInfo, decoratorStore } from './suite-definition-container';
import {
  RunInfo, createRun,
  LifeCycleMethodInfo, createLifeCycleMethods, LifeCycleMethod,
} from './definitions';

export interface RunDefinitions {
  target: Cls<any>,
  run: RunInfo | undefined;
  lifeCycle: LifeCycleMethodInfo;
}

export function createRunDefinitions(target: Cls<any>, metadata: Map<Decorator<any>, MetadataInfo[]>): RunDefinitions {
  const inheritanceChain = getInheritanceChain(target, true);

  for (const baseTarget of inheritanceChain) {
    const baseContainer = decoratorStore.getTarget(baseTarget);
    if (baseContainer) {
      baseContainer.extendDecoratorMetadata(decoratorStore, target);
    }
  }

  const run = createRun(metadata);
  const runDefinitions: RunDefinitions = {
    target,
    run,
    lifeCycle: createLifeCycleMethods(metadata, 'all'),
  };

  return runDefinitions;
}