import { isFunction } from '../../utils';
import { TouchStoneRun } from '../../decorators/touchstone';

export function filterNonFunction(name: string, filter: string | RegExp | (string | RegExp)[]) {
  const filters = Array.isArray(filter) ? filter : [filter];
  for (const f of filters) {
    if (typeof f === 'string') {
      if (f === name) {
        return true;
      }
    } else if (f.test(name)) {
      return true;
    }
  }
  return false;
}

export function filterSuite(name: string, filter: TouchStoneRun['suites']): boolean {
  if (isFunction(filter)) {
    return filter(name);
  } else if (!!filter) {
    return filterNonFunction(name, filter);
  } else {
    return true;
  }
}

export function filterCase(name: string, suiteName: string, filter: TouchStoneRun['cases']): boolean {
  if (isFunction(filter)) {
    return filter(name, suiteName);
  } else if (!!filter) {
    return filterNonFunction(name, filter);
  } else {
    return true;
  }
}
