import { SuiteResult } from '../../result/suite-result';

export interface TouchStoneEndEvent {
  type: 'touchStoneEnd';
  results: SuiteResult[];
}