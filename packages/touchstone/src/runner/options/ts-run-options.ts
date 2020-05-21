import { TouchStoneRun, InternalTsRunOptions } from '../../decorators/touchstone';
import { processBenchmarkOptions } from './benchmark-options';

export function processTsRunOptions(options: TouchStoneRun): InternalTsRunOptions {
  const { benchmarkOptions, ...rest } = options || {};

  const result: InternalTsRunOptions = {
    ...rest,
    benchmarkOptions: processBenchmarkOptions(benchmarkOptions || {}),
  };

  return result;
}
