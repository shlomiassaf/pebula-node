import * as benchmark from 'benchmark';
import { decoratorStore } from '../store';
import { TsGlobalContext } from '../result/global-context';
import { TouchStoneStartEvent, TouchStoneEndEvent } from './events';
import { createSuite } from './suite';
import { filterSuite } from './options/filter';

declare module 'benchmark' {
  export interface Suite {
    name: string;
  }
}

function runSuites(context: TsGlobalContext,
                   done: (errEvent?: benchmark.Event) => void,
                   suitCycle?: (suite: benchmark.Suite, event: benchmark.Event) => boolean | void) {
  if (!context.hasNext()) {
    done();
  } else {
    const sDefs = context.getNext();
    if (filterSuite(sDefs.suite.metadata.name, context.options.suites)) {
      const suite = createSuite(sDefs, context);
      suite
        .on('complete', (event: benchmark.Event) => {
          if (suitCycle) {
            suitCycle(suite, event);
          }
          suite.off();
          runSuites(context, done, suitCycle);
        })
        .on('error', (event: benchmark.Event) => {
          suite.abort();
          done(event);
        })
        .run();
    } else {
      runSuites(context, done, suitCycle);
    }
  }
}

let IS_RUNNING = false;
export async function touchStone() {
  if (IS_RUNNING) {
    throw new Error('TouchStone is already running...');
  } else {
    IS_RUNNING = true;
  }

  const context = new TsGlobalContext(decoratorStore.getTargets());
  const { runner } = context;

  if (runner.def.lifeCycle.touchStoneStart) {
    const touchStoneStart: TouchStoneStartEvent = { type: 'touchStoneStart' };
    const promises = runner.def.lifeCycle.touchStoneStart
      .map( handler => Promise.resolve(handler.method.call(runner.instance, touchStoneStart)) );

    await Promise.all(promises);
  }

  return new Promise( (resolve, reject) => {
    runSuites(
      context,
      (errEvent?) => {
        const beforeResolve = (err?: any) => {
          IS_RUNNING = false;
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        };
    
        if (errEvent) {
          beforeResolve(errEvent.target['error']);
        } else {
          if (runner.def.lifeCycle.touchStoneEnd) {
            const touchStoneEnd: TouchStoneEndEvent = { type: 'touchStoneEnd', results: context.getResults() };
            const promises = runner.def.lifeCycle.touchStoneEnd
              .map( handler => Promise.resolve(handler.method.call(runner.instance, touchStoneEnd)) );

            Promise
              .all(promises)
              .then(() => beforeResolve() )
              .catch(beforeResolve);
          } else {
            beforeResolve();
          }
        }
      });
  });
}
