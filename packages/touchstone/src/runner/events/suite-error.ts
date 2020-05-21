import { BaseEvent } from './base-event';

export interface SuiteErrorEvent extends BaseEvent<'error'> {
  error: Error;
}