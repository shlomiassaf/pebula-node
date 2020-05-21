import { Suite, Case } from '../../src/decorators';
import { decoratorStore } from '../../src/store';

  describe('decorators', () => {
    it('should have all decorators registered', () => {
      expect(decoratorStore.exists(Suite)).toBe(true);
      expect(decoratorStore.exists(Case)).toBe(true);
    });
});
