import { MethodDecoratorArgs } from '../../utils';
import { Decorator } from '../../decoration';
import { NoopMetadataArgs, OnStart, OnCaseComplete, OnAbort, OnError, OnReset, OnComplete, OnTouchStoneStart, OnTouchStoneEnd } from '../../decorators/life-cycle-methods';
import { MetadataInfo } from '../suite-definition-container';
import { isAsyncMethod } from '../utils';

export interface LifeCycleMethod {
  key: string | symbol;
  method: (...args: any) => any;
  isPromise: boolean;
}

export interface BenchmarkLifeCycleMethodInfo {
  start?: LifeCycleMethod[];
  cycle?: LifeCycleMethod[];
  abort?: LifeCycleMethod[];
  error?: LifeCycleMethod[];
  reset?: LifeCycleMethod[];
  complete?: LifeCycleMethod[];
}

export interface TouchStoneLifeCycleMethodInfo {
  touchStoneStart?: LifeCycleMethod[];
  touchStoneEnd?: LifeCycleMethod[];
}

export type LifeCycleMethodInfo = BenchmarkLifeCycleMethodInfo & TouchStoneLifeCycleMethodInfo;

/** Only events fired by benchmark.js */
const BENCHMARK_LIFE_CYCLE_METHOD_DECORATORS: () => Partial<Record<keyof BenchmarkLifeCycleMethodInfo, Decorator<NoopMetadataArgs>>> = () => ({
  start: OnStart,
  cycle: OnCaseComplete,
  abort: OnAbort,
  error: OnError,
  reset: OnReset,
  complete: OnComplete,
});

const TOUCHSTONE_LIFE_CYCLE_METHOD_DECORATORS: () => Partial<Record<keyof TouchStoneLifeCycleMethodInfo, Decorator<NoopMetadataArgs>>> = () => ({
  touchStoneStart: OnTouchStoneStart,
  touchStoneEnd: OnTouchStoneEnd,
});

function createLifeCycleMethodInfo(rawInfo: MetadataInfo<NoopMetadataArgs>): LifeCycleMethod {
  const { target, key, descriptor } = (rawInfo.decoratorArgs as MethodDecoratorArgs);
  return {
    key,
    method: descriptor.value,
    isPromise: isAsyncMethod(target, key),
  };
}

export function getLifeCycleMethodForDecorator(metadata: Map<Decorator<any>, MetadataInfo[]>, decor: Decorator<NoopMetadataArgs>): LifeCycleMethod[] {
  const metaInfos = metadata.get(decor) || [];
  return metaInfos.map(createLifeCycleMethodInfo);
}

export function createLifeCycleMethods(metadata: Map<Decorator<any>, MetadataInfo[]>, include: 'benchmark'): BenchmarkLifeCycleMethodInfo;
export function createLifeCycleMethods(metadata: Map<Decorator<any>, MetadataInfo[]>, include: 'touchstone'): TouchStoneLifeCycleMethodInfo;
export function createLifeCycleMethods(metadata: Map<Decorator<any>, MetadataInfo[]>, include: 'all'): LifeCycleMethodInfo;
export function createLifeCycleMethods(metadata: Map<Decorator<any>, MetadataInfo[]>, include: 'benchmark' | 'touchstone' | 'all'): LifeCycleMethodInfo {
  let entires: Array<[string, Decorator<NoopMetadataArgs>]>;
  switch (include) {
    case 'benchmark':
      entires = Object.entries(BENCHMARK_LIFE_CYCLE_METHOD_DECORATORS());
      break;
    case 'touchstone':
      entires = Object.entries(TOUCHSTONE_LIFE_CYCLE_METHOD_DECORATORS());
      break;
    case 'all':
      entires = Object.entries({ ...BENCHMARK_LIFE_CYCLE_METHOD_DECORATORS(), ...TOUCHSTONE_LIFE_CYCLE_METHOD_DECORATORS() });
  }

  const result: LifeCycleMethodInfo = {};
  for (const [key, decor] of entires) {
    const lcMethods = getLifeCycleMethodForDecorator(metadata, decor)
    if (lcMethods.length > 0) {
      result[key] = lcMethods;
    }
  }
  return result;
}
