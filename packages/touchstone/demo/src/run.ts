import { TouchStone, Suite, OnStart, Mixin, VegaLiteReporter, SimpleConsoleReporter, run } from '@pebula/touchstone';
import { ALL } from './cases';
import { createData } from './data';

@Suite({ name: 'Runtime Validation and Typescript Support', caseInvokeType: 'method' })
class TestSuite extends Mixin(...ALL) {
  @OnStart()
  onStart(event) {
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
}

async function main() {
  await run();
}

main().then( () => console.log('DONE'), err => console.error(err) );
