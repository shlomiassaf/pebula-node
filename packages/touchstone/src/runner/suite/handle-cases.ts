import * as benchmark from 'benchmark';
import { InternalTsRunOptions } from '../../decorators/touchstone';
import { SuiteDefinitions } from '../../store/suite-definition';
import { mergeBenchmarkOptions, filterCase } from '../options';
import { TsGlobalContext } from '../../result';

function updateIfDeffered(method: (...args: any) => any, benchmarkOptions: benchmark.Options, isPromise: boolean) {
  if (isPromise) {
    benchmarkOptions.defer = true;
    const originalMethod = method;
    method = (deferred: benchmark.Deferred & { resolve: () => void }) => {
      originalMethod()
        .then( () => deferred.resolve() )
        .catch(err => {
          deferred.benchmark.error = err;
          deferred.resolve();
        });
    }
  }
  return method;
}

export function handleCases(suiteDefs: SuiteDefinitions, suite: benchmark.Suite, options: InternalTsRunOptions, context: any, globalContext: TsGlobalContext): void {
  const suiteName = suiteDefs.suite.metadata.name;
  const caseInvokeType = suiteDefs.suite.metadata.caseInvokeType;

  for (const [caseName, c] of suiteDefs.cases.entries()) {
    if (filterCase(caseName, suiteName, options.cases)) {
      // clone the options (event if user did not add Case level options...)
      const benchmarkOptions = mergeBenchmarkOptions(options.benchmarkOptions, c.metadata.benchmarkOptions || {});
      const caseMethod = caseInvokeType === 'method' ? c.method.bind(context) : c.method;
      suite.add(
        caseName,
        updateIfDeffered(caseMethod, benchmarkOptions, c.isPromise),
        benchmarkOptions
      );

      if (Array.isArray(c.metadata.variants)) {
        for (const v of c.metadata.variants) {
          const vBenchmarkOptions = mergeBenchmarkOptions(options.benchmarkOptions, v.benchmarkOptions);
          const vCaseMethod = caseInvokeType === 'method' ? c.method.bind(context) : c.method;
          suite.add(
            v.name,
            updateIfDeffered(vCaseMethod, vBenchmarkOptions, c.isPromise),
            vBenchmarkOptions
          );
        }
      }
    }
  }
}
