import * as benchmark from 'benchmark';

export type BenchmarkEventType = 'start' | 'caseComplete' | 'complete' | 'error' | 'reset' | 'abort';

export interface BaseEvent<T extends BenchmarkEventType = BenchmarkEventType> {
  type: T;
  rawEvent: benchmark.Event;
  suite: benchmark.Suite;
  suiteProgress: {
    current: number;
    total: number;
    completed: boolean;
  }
}
