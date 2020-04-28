import { CTOR_INVOKED } from './constants';
import { checkIfCtorInvoked, ensureInstanceOf } from './utils';
import { GtLocalInfo } from './local-info';


/**
 * Sync between two instances of a model/resource.
 *
 * The `source` instance is merged into the `target` instance based on the property metadata
 * defined for model/resource represented by the `localInfo` (i.e. "the type").
 *
 * There are 2 scenarios which apply based on "the type":
 * 1. `source` is an instance of "the type"
 * 2. `source` is an object of similar structure to "the type" (i.e. "the type" like)
 *
 * Method Logic/Phases:
 *
 * (A) Ensure "the type" used is the right one
 * Analyze "the type" to verify it is not the root type of a discriminator chain.
 * If it's a root type, the actual type is matched and it will be used as "the type" from here on.
 *
 * (B) Ensure that "the type" constructor was invoked
 * If we're in scenario 1, it's an instance of "the type" so by definition the constructor ran.
 * If we're in scenario 2, a new instance of "the type" is created which replaces the `source` and used the old `source` as a parameter (doc).
 * After this phase, `source` is guaranteed to be an instance of "the type".
 *
 * (C) Process all declared property (`@GtLocalProp` and `@GtColumn`)
 * All known properties are iterated and:
 * - Local properties are assigned to the target
 * - Embedded properties are synced (recursive call to `syncSchemaInstances` on each embedded property)
 *   Note that properties of embedded containers are skipped since each of them is handled by GooseType's document array implementation
 * @param source
 * @param target
 * @param localInfo
 */

/**
 * This is a Model so the call to `super` already assigned all columns
 * We need to handle 2 cases:
 * - Assign local fields (`@GtLocalProp()`) since Model does not handle them
 * - For each embedded column (column which reference a known user model), re-apply it's children fields.
 * Note that we don't walk over columns of embedded containers since each of them is handled by GooseType's document array implementation
 * @param source
 * @param target
 * @param localInfo The local info class of the type for this sync.
 *                  NOTE: Make sure root discriminator types are resolved to the actual type.
 * @param skipTargetCheck When false (default), will check if the target already synced by this method and if so will do nothing.
 *                        When true, does not check for that and sync anyway.
 * @param bindToTarget Wether to bind all properties to on the source to the target using property descriptors.
 *                     When null (default), will detect automatically by inspecting the source and if it's of "the type" will bind.
 *                     Otherwise, binds based on the input value (true/false)
 */
export function syncModelInstance(source: any, target: any, localInfo: GtLocalInfo, skipTargetCheck = false, bindToTarget = null) {
  if (skipTargetCheck || !checkIfCtorInvoked(target)) {
    const bind = bindToTarget === null ? checkIfCtorInvoked(source) : bindToTarget;
    for (const [key, prop] of localInfo.props) {
      if (key in source) {
        // All embedded properties on model are wrapped so this will trigger a recursion call to here again
        target[key] = source[key];
      }
      if (bind) {
        Object.defineProperty(source, key, { get: () => target[key], set: value => target[key] = value });
      }
    }
    Reflect.set(target, CTOR_INVOKED, true);
  }
}
