import { SbErrorHandler, SbErrorEvent, SbMessageErrorEvent } from '@pebula/attribus';

export class TestErrorHandler extends SbErrorHandler {
  lastError: SbErrorEvent[] = [];
  lastMessageError: SbMessageErrorEvent[] = [];

  async onError(event: SbErrorEvent) {
    this.lastError.push(event);
  }

  async onMessageError(event: SbMessageErrorEvent) {
    this.lastMessageError.push(event);
  }

  reset() {
    this.lastError = [];
    this.lastMessageError = [];
  }
}
