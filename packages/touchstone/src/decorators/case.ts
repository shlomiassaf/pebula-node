import { MethodDecoratorOf, MethodDecoratorArgs } from '../utils';
import { decoratorStore } from '../store';
import { BenchmarkOptions } from '../interfaces';
import { ensureName } from './utils';

export interface CaseMetadataArgs {
  /**
   * The name of the performance test.
   * This is not mandatory, if not set the method name is used.
   * @defaultValue The method name
   */
  name?: string;

  /**
   * The default benchmark options for the `Case`.
   *
   * ## Options resolution process:
   *
   * For each `Case` select the options by merging the following objects (first one wins):
   * 
   * - Use options defined on the Case (WE ARE HERE)
   * - Use options defined on the Suite
   * - Use options defined for the entire run
   * - Use the default options defined by the library (static)
   */
  benchmarkOptions?: BenchmarkOptions;

  /**
   * A list of variants that will run in the suite, each as a separate case.
   * I.E. run the same method as a new case but with a different benchmark configuration set.
   *
   * > Note that each variant must have a unique name across the entire suite and must not match the original name
   * or any other variant name for this method and other methods within the Suite.
   *
   * > Note that filters apply on each variant like it will on any regular case.
   */
  variants?: Array<Required<Omit<CaseMetadataArgs, 'variants'>>>;
}

export const Case = decoratorStore
  .createDecorator<CaseMetadataArgs, MethodDecoratorOf<any, any>>({
    allowMulti: true,
    allowedTargets: ['method'],
    onExecute: (decoratorArgs: MethodDecoratorArgs, metadata) => ensureName(decoratorArgs, metadata),
  });
