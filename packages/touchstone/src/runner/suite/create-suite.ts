import * as benchmark from 'benchmark';
import { SuiteDefinitions } from '../../store/suite-definition';
import { mergeBenchmarkOptions } from '../options';
import { TsGlobalContext } from '../../result';
import { handleLifeCycle } from './handle-lifecycle';
import { handleCases } from './handle-cases';

export function createSuite(suiteDefs: SuiteDefinitions, globalContext: TsGlobalContext) {
  let options = globalContext.options;
  // Clone it all
  options = {
    ...options,
    benchmarkOptions: mergeBenchmarkOptions(options.benchmarkOptions, suiteDefs.suite.metadata.benchmarkOptions || {}),
  };

  const name = suiteDefs.suite.metadata.name;
  const bSuite = new benchmark.Suite(name, { name, async: true });
  globalContext.addSuite(bSuite);

  const ctx = new suiteDefs.suite.cls();
  handleLifeCycle(suiteDefs.lifeCycle, bSuite, options, ctx, globalContext);
  handleLifeCycle(globalContext.runner.def.lifeCycle, bSuite, options, globalContext.runner.instance, globalContext);
  handleCases(suiteDefs, bSuite, options, ctx, globalContext);

  return bSuite;
}
