import * as benchmark from 'benchmark';
import { InternalTsRunOptions } from '../../decorators/touchstone';
import { LifeCycleMethodInfo } from '../../store/definitions';
import { TsGlobalContext } from '../../result';

export function handleLifeCycle(lifeCycle: LifeCycleMethodInfo,
                                suite: benchmark.Suite,
                                options: InternalTsRunOptions,
                                context: any,
                                globalContext: TsGlobalContext): void {
  for (const [key, lcMethods] of Object.entries(lifeCycle)) {
    for (const lcInfo of lcMethods) {
      suite.on(key, function(this: benchmark.Suite, event: benchmark.Event) {
        return lcInfo.method.call(context, globalContext.createEvent(event, this));
      });
    }
  }
}
