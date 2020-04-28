// tslint:disable: no-empty
import { getMemberType, getMethodParamTypes, getMethodReturnType, getCtorParamTypes } from './decorators';

const TestDecor = () => (target: any, key?: any, descriptor?: any) => {};

@TestDecor()
class TestClass {
  @TestDecor()
  stringProp: string;
  noReflection: string;

  constructor(a: Date, b: number) { }

  @TestDecor()
  method(parmStr: string, paramDate: Date, paramBool: boolean): number {
    return 5;
  }
}

describe('goosetyped', () => {
  describe('Utils', () => {
    it('should extract member types from reflection', () => {
      expect(getMemberType(TestClass.prototype, 'stringProp')).toBe(String);
      expect(getMemberType(TestClass.prototype, 'noReflection')).toBeUndefined();
    });

    it('should extract method return type from reflection', () => {
      expect(getMethodReturnType(TestClass.prototype, 'method')).toBe(Number);
    });

    it('should extract method parameters type from reflection', () => {
      expect(getMethodParamTypes(TestClass.prototype, 'method')).toEqual([String, Date, Boolean]);
    });

    it('should extract the constructor parameters type from reflection', () => {
      expect(getCtorParamTypes(TestClass)).toEqual([Date, Number]);
    });
  });
});
