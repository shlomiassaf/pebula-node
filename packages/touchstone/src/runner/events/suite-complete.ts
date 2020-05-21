import { BaseEvent } from './base-event';
import { CaseResult } from '../../result/case-result';
import { SuiteResult } from '../../result/suite-result';

export interface SuiteCompleteEvent extends BaseEvent<'complete'> {
  result: CaseResult[];
}