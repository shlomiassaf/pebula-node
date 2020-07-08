import { MessagingError } from '@azure/service-bus';
import { SbQueueMetadataOptions, SbSubscriptionMetadataOptions } from '../interfaces';

export class SbErrorEvent {
  constructor(
    public readonly phase: 'verify' | 'register' | 'listening',
    public readonly options: SbQueueMetadataOptions | SbSubscriptionMetadataOptions,
    public readonly error: Error | MessagingError,
  ) { }
}

export class SbMessageErrorEvent {
  constructor(
    public readonly options: SbQueueMetadataOptions | SbSubscriptionMetadataOptions,
    public readonly error: Error,
  ) { }
}