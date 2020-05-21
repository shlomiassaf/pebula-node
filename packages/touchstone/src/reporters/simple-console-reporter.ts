import { OnStart, OnCaseComplete, OnComplete, OnTouchStoneEnd, OnError } from '../decorators';
import { SuiteStartEvent, CaseCompleteEvent, SuiteErrorEvent, SuiteCompleteEvent, TouchStoneEndEvent } from '../runner/events';

export abstract class SimpleConsoleReporter {

  @OnStart()
  onSimpleConsoleReporterStart(event: SuiteStartEvent) {
    console.log('======================================================================');
    console.log(`Starting Suite: ${event.suite.name} [${event.suiteProgress.current}/${event.suiteProgress.total}]`);
    console.log('======================================================================');
    console.log('\n');
  }

  @OnCaseComplete()
  onSimpleConsoleReporterCycle(event: CaseCompleteEvent) {
    console.log(String(event.rawEvent.target));
  }

  @OnError()
  onSimpleConsoleReporterError(event: SuiteErrorEvent) {
    console.error(event.error);
  }

  @OnComplete()
  onSimpleConsoleReporterComplete(event: SuiteCompleteEvent) {
    console.log('======================================================================');
    console.log(`Suite Ended: ${event.suite.name}`);
    console.log('======================================================================');
    console.log('\n');
  }

  @OnTouchStoneEnd()
  onSimpleConsoleReporterFinalize(event: TouchStoneEndEvent) {
    console.log('Benchmark Finished!');
  }
}
