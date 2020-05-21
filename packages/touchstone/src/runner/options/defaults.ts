import * as benchmark from 'benchmark';
import { BenchmarkOptions } from '../../interfaces';

export const BENCHMARK_OPTIONS: Required<BenchmarkOptions> = {
  delay: benchmark.options.delay,
  initCount: benchmark.options.initCount,
  maxTime: benchmark.options.maxTime,
  minSamples: benchmark.options.minSamples,
  minTime: benchmark.options.minTime,
}
