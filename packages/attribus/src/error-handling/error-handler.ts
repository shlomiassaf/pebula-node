import { SbErrorEvent, SbMessageErrorEvent } from './error-event';

export abstract class SbErrorHandler {
  abstract onError(event: SbErrorEvent): Promise<void>;

  abstract onMessageError(event: SbMessageErrorEvent): Promise<void>;
}

