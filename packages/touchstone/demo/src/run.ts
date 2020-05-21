import * as Path from 'path';
import * as FS from 'fs';
import { TouchStone, Suite, OnStart, Mixin, VegaLiteReporter, SimpleConsoleReporter, touchStone, SuiteStartEvent } from '@pebula/touchstone';
import { ALL } from './cases';
import { createData } from './data';

@Suite({ name: 'Runtime Validation and Typescript Support', caseInvokeType: 'method' })
class TestSuite extends Mixin(...ALL) {
  @OnStart()
  onStart(event: SuiteStartEvent) {
    this.data = createData();
  }
}

@TouchStone() 
class TestRun extends Mixin(SimpleConsoleReporter, VegaLiteReporter) {
  benchmarkOptions = {
    delay: 0.5,
    initCount: 5,
  };

  getVegaLiteReporterFileOrientation() {
    return 'vertical' as 'vertical';
  }

  getVegaLiteReporterFilename(): string {
    const destDir = Path.join(process.cwd(), '../../.gh-pages-build/touchstone/demo');
    if (!FS.existsSync(destDir)) {
      FS.mkdirSync(destDir, { recursive: true });
    }
    return Path.join(destDir,'benchmark-chart');
  }

}
