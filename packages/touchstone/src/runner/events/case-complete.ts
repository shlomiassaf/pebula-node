import { BaseEvent } from './base-event';
import { CaseResult } from '../../result/case-result';

export interface CaseCompleteEvent extends BaseEvent<'caseComplete'> {
  caseResult: CaseResult;
}
