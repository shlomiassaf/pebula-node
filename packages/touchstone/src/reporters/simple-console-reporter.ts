import { OnStart, OnCaseComplete, OnComplete, OnTouchStoneEnd } from '../decorators';
import { SuiteStartEvent, CaseCompleteEvent, SuiteCompleteEvent, TouchStoneEndEvent } from '../runner/events';

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
