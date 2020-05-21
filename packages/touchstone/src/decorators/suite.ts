import { ClassDecoratorOf } from '../utils';
import { BenchmarkOptions } from '../interfaces';
import { decoratorStore } from '../store';
import { ensureName } from './utils';

export interface SuiteMetadataArgs {
  /**
   * The name of the suite.
   * This is not mandatory, if not set the class name is used.
   * @defaultValue The class name
   */
  name?: string;

  /**
   * The default benchmark options for the entire `Suite`.
   *
   * ## Options resolution process:
   *
   * For each `Case` select the options by merging the following objects (first one wins):
   * 
   * - Use options defined on the Case
   * - Use options defined on the Suite (WE ARE HERE)
   * - Use options defined for the entire run
   * - Use the default options defined by the library (static)
   */
  benchmarkOptions?: BenchmarkOptions;

  /**
   * Define how cases in the suite are invoked.
   *
   * - function: Invoke like standalone function, no context (this) is set
   * - method: Invoke as part of the class with the context (this).
   *   I.E: A new instance of the suite is created and used as the context for all cases.
   *
   * @defaultValue 'function'
   */
  caseInvokeType?: 'method' | 'function';
}

export const Suite = decoratorStore
  .createDecorator<SuiteMetadataArgs, ClassDecoratorOf<any>>({
    allowedTargets: ['class'],
    onExecute: (decoratorArgs, metadata) => ensureName(decoratorArgs, metadata),
  });
