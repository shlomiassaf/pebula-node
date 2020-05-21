import * as benchmark from 'benchmark';

export interface BenchmarkOptions {

  /**
   * The delay between test cycles (secs).
   * @defaultValue 0.005 (from benchmark.js)
   * @link https://benchmarkjs.com/docs#options_delay
   */
  delay?: number;
  /**
   * The default number of times to execute a test on a benchmark’s first cycle.
   * @defaultValue 1 (from benchmark.js)
   * @link https://benchmarkjs.com/docs#options_initCount
   */
  initCount?: number;
  /**
   * The maximum time a benchmark is allowed to run before finishing (secs).
   * @defaultValue 5 (from benchmark.js)
   * @link https://benchmarkjs.com/docs#options_maxTime
   */
  maxTime?: number;
  /**
   * The minimum sample size required to perform statistical analysis.
   * @defaultValue 5 (from benchmark.js)
   * @link https://benchmarkjs.com/docs#options_minSamples
   */
  minSamples?: number;
  /**
   * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
   * @defaultValue 0 (from benchmark.js)
   * @link https://benchmarkjs.com/docs#options_minTime
   */
  minTime?: number;
}
