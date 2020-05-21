import { Suite, Case } from '../../src/decorators';
import { decoratorStore } from '../../src/store';

describe('touchstone', () => {
  describe('suite-metadata', () => {
    // xit('should register all suites', () => {
    //   const testSuite1Meta = {};
    //   @Suite(testSuite1Meta)
    //   class TestSuite1 {
    //     @Case() myCase1() { }
    //   }

    //   const testSuite2Meta = { name: 'CustomTestSuite2' };
    //   @Suite(testSuite2Meta)
    //   class TestSuite2 {
    //     @Case({ name: 'test' }) myCase2() { }
    //     @Case() myCase2b() { }
    //   }

    //   const suites = Array.from(decoratorStore.getSuites());
    //   expect(suites.length).toBe(2);

    //   const [suite1, suite2] = suites;
    //   expect(suite1.cls).toBe(TestSuite1);
    //   expect(suite2.cls).toBe(TestSuite2);

    //   const meta1 = {
    //     suite: suite1.getMetadataInfo(Suite),
    //     cases: suite1.getMetadataInfo(Case),
    //   }
    //   expect(meta1.suite.metadata).toBe(testSuite1Meta);
    //   expect(meta1.cases).toBeInstanceOf(Array);
    //   expect(meta1.cases['length']).toBe(1);


    //   const meta2 = {
    //     suite: suite2.getMetadataInfo(Suite),
    //     cases: suite2.getMetadataInfo(Case),
    //   }
    //   expect(meta2.suite.metadata).toBe(testSuite2Meta);
    //   expect(meta2.cases).toBeInstanceOf(Array);
    //   expect(meta2.cases['length']).toBe(2);
    //   expect(meta2.cases[0].metadata.name).toBe('test');
    // });
  })
});