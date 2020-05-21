import * as benchmark from 'benchmark';
import { TsGlobalContext } from '../../result/global-context';
import { CaseCompleteEvent } from './case-complete';
import { SuiteCompleteEvent } from './suite-complete';
import { SuiteStartEvent } from './suite-start';
import { SuiteResetEvent } from './suite-reset';
import { SuiteErrorEvent } from './suite-error';
import { SuiteAbortEvent } from './suite-abort';

export function createEvent(rawEvent: benchmark.Event, suite: benchmark.Suite, context: TsGlobalContext) {
  const base = {
    rawEvent,
    suite,
    suiteProgress: {
      current: context.currentSuiteCount,
      total: context.totalSuiteCount,
      completed: context.currentSuiteCount >= context.totalSuiteCount,
    },
  };

  switch (rawEvent.type) {
    case 'cycle':
      return {
        type: 'caseComplete',
        ...base,
        caseResult: context.getResult(suite, rawEvent),
      } as CaseCompleteEvent;
    case 'start':
      return {
        type: 'start',
        ...base,
      } as SuiteStartEvent;
    case 'complete':
      return {
        type: 'complete',
        ...base,
        result: context.getResults(suite),
      } as SuiteCompleteEvent;
    case 'reset':
      return {
        type: 'reset',
        ...base,
      } as SuiteResetEvent;
    case 'abort':
      return {
        type: 'abort',
        ...base,
      } as SuiteAbortEvent;
    case 'error':
      return {
        type: 'error',
        ...base,
        error: base.rawEvent.target['error'],
      } as SuiteErrorEvent;
  }
  throw new Error(`Unknown Event ${event.type}`);
}
