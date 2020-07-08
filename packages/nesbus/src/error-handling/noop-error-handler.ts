import { SbErrorEvent, SbMessageErrorEvent } from './error-event';
import { SbErrorHandler } from './error-handler';

export class SbNoopErrorHandler extends SbErrorHandler {
  async onError(event: SbErrorEvent) {
    
  }
  async onMessageError(event: SbMessageErrorEvent) {
    
  }
}
