import * as benchmark from 'benchmark';
import '../../src/index';
import { Suite, Case, OnStart, OnComplete } from '../../src/decorators';
import { SuiteStartEvent, SuiteCompleteEvent, run } from '../../src/runner';

describe('touchstone', () => {
  describe('run', () => {
    it('should register all suites', async () => {

      @Suite()
      class TestSuite1 {
        @OnStart()
        onStart(event: SuiteStartEvent) {
          console.log('DO OnStart');
        }
        @Case() myCase1() { }

        @OnComplete()
        onComplete(event: SuiteCompleteEvent) {
          console.log('DO OnComplete');
        }
      }

      const testSuite2Meta = { name: 'CustomTestSuite2' };
      @Suite(testSuite2Meta)
      class TestSuite2 {
        @Case({ name: 'test' }) myCase2() { }
        @Case() async myCase2b() { }
      }

      await run()
    });
  })
});