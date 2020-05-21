import * as benchmark from 'benchmark';
import { ClassDecoratorOf } from '../utils';
import { BenchmarkOptions } from '../interfaces';
import { decoratorStore } from '../store';
import { ensureName } from './utils';
import { touchStone } from '../runner/run';

export interface TouchStoneMetadataArgs {
  /**
   * The name of the touchstone configuration.
   * This is not mandatory, if not set the class name is used.
   *
   * You can ues this value to filter configurations.
   *
   * @defaultValue The class name
   */
  name?: string;

  /**
   * When true, will not run automatically, instead it will wait for manual execution.
   * @defaultValue false
   */
  manualRun?: boolean;
}

export interface TouchStoneRun {
  suites?: string | string[] | RegExp | RegExp[] | ((name: string) => boolean);
  cases?: string | string[] | RegExp | RegExp[] | ((name: string, suiteName: string) => boolean);

  /**
   * The default benchmark options for the entire run.
   *
   * ## Options resolution process:
   *
   * For each `Case` select the options by merging the following objects (first one wins):
   * 
   * - Use options defined on the Case
   * - Use options defined on the Suite
   * - Use options defined for the entire run (WE ARE HERE)
   * - Use the default options defined by the library (static)
   */
  benchmarkOptions?: BenchmarkOptions;
}

export type InternalTsRunOptions = Omit<TouchStoneRun, 'benchmarkOptions'> & { benchmarkOptions: benchmark.Options };

export const TouchStone = decoratorStore
  .createDecorator<TouchStoneMetadataArgs, ClassDecoratorOf<TouchStoneRun & { [key: string]: any }>>({
    allowedTargets: ['class'],
    onExecute: (decoratorArgs, metadata) => {
      metadata = ensureName(decoratorArgs, metadata);
      if (!metadata.manualRun) {
        process.nextTick(async () => {
          try {
            await touchStone();
            process.exit(0);
          } catch (err) {
            console.error(err);
            process.exit(1);
          }
        });
      }
      
      return metadata;
    },
  });
