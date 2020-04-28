import { Ctor } from '../utils/types';

export function resolveEnum(enumObject: object, enumType: Ctor<any>): number[] | string[] | undefined {
  switch (enumType) {
    case Number:
      return Object.values(enumObject)
        .filter((enumValue) => typeof enumValue === 'number');
    case String:
      return Object.values(enumObject);
  }
}
