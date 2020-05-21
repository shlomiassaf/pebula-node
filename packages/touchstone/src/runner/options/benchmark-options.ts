import * as benchmark from 'benchmark';
import { BenchmarkOptions } from '../../interfaces';
import { BENCHMARK_OPTIONS } from './defaults';

export function processBenchmarkOptions(benchmarkOptions: BenchmarkOptions) {
  const result: BenchmarkOptions = {};
  for (const k of Object.keys(BENCHMARK_OPTIONS)) {
    result[k] = k in benchmarkOptions ? benchmarkOptions[k] : BENCHMARK_OPTIONS[k];
  }
  return result;
}

export function mergeBenchmarkOptions<T extends benchmark.Options | BenchmarkOptions>(source: T, benchmarkOptions: BenchmarkOptions): T {
  const result: T = { ...source };
  for (const k of Object.keys(BENCHMARK_OPTIONS)) {
    if (k in benchmarkOptions) {
      result[k] = benchmarkOptions[k];
    }
  }
  return result;
}
