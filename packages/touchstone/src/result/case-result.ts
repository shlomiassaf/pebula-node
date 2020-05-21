import { Target, Stats, Times } from 'benchmark';
import { BenchmarkOptions } from '../interfaces';
import { mergeBenchmarkOptions } from '../runner/options';

/**
 * An object of stats including mean, margin or error, and standard deviation.
 * @link https://benchmarkjs.com/docs#prototype_stats
 */
export interface CaseStats extends Stats {
  min: number;
  max: number;
  median: number;
}

export interface CaseResult {
  name: string;
  /**
   * The benchmark options used to run this case.
   */
  benchmarkOptions: BenchmarkOptions;

  /**
   * Indicates (when truthy) if the current case is a variant case.
   * If truthy, the actual value represents the name of the root case which it is a variant of.
   */
  variantParent?: string;

  /**
   * The number of executions per second. (Operations Per Second)
   * @link https://benchmarkjs.com/docs#prototype_hz
   */
  hz: number;
  hzDeviation: number;
  hzSamples: number[];

  /**
   * An object of stats including mean, margin or error, and standard deviation.
   */
  stats: CaseStats;

  /**
   * An object of timing data including cycle, elapsed, period, start, and stop.
   * @link https://benchmarkjs.com/docs#prototype_times
   */
  timing: Times;
}

function calcHzDeviation(samples: number[]) {
  let sum = 0;
  for (const n of samples) {
    sum += 1 / n;
  }
  const avg = sum / samples.length;

  sum = 0
  for (const n of samples) {
    sum += Math.pow((1 / n) - avg, 2);
  }
  return Math.sqrt(sum / samples.length)
}

function calculateMedian(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  const mid = Math.floor(values.length / 2);
  const sortedValues = [...values].sort((a, b) => a - b);
  return values.length % 2 !== 0 ? sortedValues[mid] : (sortedValues[mid - 1] + sortedValues[mid]) / 2;
};

function createCaseStats(stats: Stats): CaseStats {
  return {
    ...(stats),
    min: Math.min(...stats.sample),
    max: Math.max(...stats.sample),
    median: calculateMedian(stats.sample),
  }
}

export function createCaseResults(b: Target) {
  const caseResult: CaseResult = {
    name: b.name,
    benchmarkOptions: mergeBenchmarkOptions({} as BenchmarkOptions, b),
    hz: b.hz,
    hzSamples: b.stats.sample.map( s => 1 / s),
    hzDeviation: calcHzDeviation(b.stats.sample),
    stats: createCaseStats(b.stats as any),
    timing: b.times as Required<Target['times']>,
  };

  return caseResult;
}
