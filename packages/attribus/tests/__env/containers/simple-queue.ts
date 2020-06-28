import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Sender, ReceiveMode } from '@azure/service-bus';
import { Queue, SbContext, QueueEmitter } from '@pebula/attribus';

import { MessageStorage } from '../services';
import { SUBSCRIBERS, EMITTERS } from './service-bus-test-entities';

export class SimpleQueueContainer {

  @QueueEmitter(EMITTERS.TEST_QUEUE_1)
  queueMethodEmitter: Sender;

  @QueueEmitter(EMITTERS.TEST_QUEUE_2)
  queuePipeEmitter: Sender;

  @QueueEmitter(EMITTERS.TEST_QUEUE_4)
  queueMethodSwallowErrorEmitter: Sender;

  constructor(public readonly store: MessageStorage) { }

  @Queue<MethodDecorator>(SUBSCRIBERS.TEST_QUEUE_1)
  async queueMethod(context: SbContext) {
    this.store.add(context);
  }

  @Queue(SUBSCRIBERS.TEST_QUEUE_2)
  queuePipe = (source: Observable<SbContext>) => source
    .pipe(
      tap( async context => this.store.add(context) ),
    )

  @Queue<MethodDecorator>(SUBSCRIBERS.TEST_QUEUE_4)
  async queueMethodSwallowError(context: SbContext) {
    this.store.add(context);
  }

  @Queue<MethodDecorator>({ name: 'INVALID',  receiveMode: ReceiveMode.peekLock, swallowErrors: true, handlerOptions: { autoComplete: true } })
  async queueMethodSwallowErrorInvalid(context: SbContext) {
    this.store.add(context);
  }
}
