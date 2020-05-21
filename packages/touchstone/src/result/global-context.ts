import * as benchmark from 'benchmark';
import { Suite, InternalTsRunOptions, TouchStone, TouchStoneRun } from '../decorators';
import { SuiteDefinitions } from '../store/suite-definition';
import { RunDefinitions } from '../store/run-definition';
import { createEvent } from '../runner/events/create-event';
import { processTsRunOptions } from '../runner/options';
import { SuiteDefinitionContainer } from '../store/suite-definition-container';
import { SuiteResult } from './suite-result';
import { CaseResult, createCaseResults } from './case-result';

export class TsGlobalContext {
  get currentSuiteCount(): number { return this.current + 1 }
  get totalSuiteCount(): number { return this.total; }

  public readonly options: InternalTsRunOptions
  public readonly runner: { def: RunDefinitions; instance: any };
  private readonly suiteDefs: SuiteDefinitions[] = [];
  
  private current = -1;
  private readonly total: number;
  private readonly targets = new Map<benchmark.Suite, Map<benchmark.Target, CaseResult>>();

  constructor(targets: IterableIterator<SuiteDefinitionContainer>) {
    const runDefs: RunDefinitions[] = [];
    for (const tc of targets) {
      if (tc.hasMetadataFor(Suite)) {
        this.suiteDefs.push(tc.getSuiteDefs());
      } else if (tc.hasMetadataFor(TouchStone)) {
        runDefs.push(tc.getRunDefs());
      }
    }

    this.runner = this.createRunContainer(runDefs);
    this.options = processTsRunOptions(this.runner.instance);

    this.total = this.suiteDefs.length;
  }

  addSuite(suite: benchmark.Suite) {
    this.targets.set(suite, new Map<benchmark.Target, CaseResult>());

    suite.on('cycle', (event: benchmark.Event) => {
      this.targets.get(suite).set(event.target, createCaseResults(event.target));
    });
  }

  createEvent(event: benchmark.Event, suite: benchmark.Suite) {
    return createEvent(event, suite, this);
  }

  hasNext() {
    return this.current < this.total -1;
  }

  getNext() {
    this.current += 1;
    return this.suiteDefs[this.current];
  }

  getResult(suite: benchmark.Suite, event: benchmark.Event | benchmark.Target): CaseResult {
    const t = 'type' in event && 'target' in event ? event.target : event;
    return this.targets.get(suite).get(t);
  }

  getResults(suite: benchmark.Suite): CaseResult[];
  getResults(): Array<SuiteResult>;
  getResults(suite?: benchmark.Suite): Array<SuiteResult> | CaseResult[] {
    if (!suite) {
      return Array.from(this.targets.entries())
        .map(([suite, targets]) => {
          return {
            name: suite.name,
            cases: Array.from(targets.values()),
          }
        });
    } else {
      return Array.from(this.targets.get(suite).values());
    }
  }

  private createRunContainer(runDefs: RunDefinitions[]) {
    if (runDefs.length === 0) {
      class DefaultTouchStoneRunner implements TouchStoneRun { }
      runDefs.push({
        target: DefaultTouchStoneRunner,
        run: {
          cls: DefaultTouchStoneRunner,
          metadata: {},
        },
        lifeCycle: {},
      });
    }

    return {
      def: runDefs[0],
      instance: new runDefs[0].run.cls(),
    };
  }
}