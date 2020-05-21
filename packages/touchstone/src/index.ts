import 'reflect-metadata';

export { Mixin } from './decoration';

export {
  BenchmarkOptions,
} from './interfaces';

export {
  TouchStone, TouchStoneMetadataArgs, TouchStoneRun,
  Suite, SuiteMetadataArgs,
  Case, CaseMetadataArgs,
  OnTouchStoneStart, OnTouchStoneEnd,
  OnStart, OnCaseComplete, OnAbort, OnError, OnReset, OnComplete, NoopMetadataArgs,
} from './decorators';

export {
  SuiteResult,
  CaseResult, CaseStats,
} from './result';

export { VegaLiteReporter, ChartJsHtmlReporter, SimpleConsoleReporter, Orientation } from './reporters';

export {
  CaseCompleteEvent,
  SuiteStartEvent,
  SuiteAbortEvent,
  SuiteCompleteEvent,
  SuiteErrorEvent,
  SuiteResetEvent,
  TouchStoneStartEvent, TouchStoneEndEvent,
  touchStone
} from './runner';

