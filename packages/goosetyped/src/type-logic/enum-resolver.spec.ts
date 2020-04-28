import { resolveEnum } from './enum-resolver';

describe('goosetyped', () => {
  describe('Schema Builder', () => {
    describe('Column Type Logic', () => {
      it('should resolve ts enum object to string[]', () => {
        enum TestEnumNum {
          a = 3,
          b = 5,
          c = 9,
        }
        expect(resolveEnum(TestEnumNum, Number)).toEqual([3, 5, 9]);

        enum TestEnumStr {
          a = '_a',
          b = '_b',
          c = '_c',
        }
        expect(resolveEnum(TestEnumStr, String)).toEqual(['_a', '_b', '_c']);
      });

      it('should not resolve mixed typed enums', () => {
        enum TestEnumNum {
          a = 3,
          b = '_b',
          c = 9,
        }
        expect(resolveEnum(TestEnumNum, Object)).toBeUndefined();
      });

    });
  });
});
