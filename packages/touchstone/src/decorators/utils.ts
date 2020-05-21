import { stringify, DecoratorArgs } from '../utils';

/**
 * Verifies that decorator metadata input is an object and that it has the name property assigned.
 * If it is falsy it will create a new object.
 * If there is no name it will assign a name based on the following logic:
 * - If it was a class decorators, will use the class name
 * - If it was a member decorator it will use the member's name
 */
export function ensureName<T extends { name?: string; }>(decoratorArgs: DecoratorArgs, metadata?: T): T {
  if (!metadata) {
    metadata = {} as T;
  }
  if (!metadata.name) {
    metadata.name = decoratorArgs.type === 'class'
      ? stringify(decoratorArgs.target)
      : stringify(decoratorArgs.key)
    ;
  }
  return metadata;
}
