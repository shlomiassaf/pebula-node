import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Sender, ReceiveMode } from '@azure/service-bus';
import { Queue, SbContext, QueueEmitter, SbIntercept } from '@pebula/attribus';
import { SbBackoffRetry } from '@pebula/attribus/tasks';

import { MessageStorage } from '../services';
import { SUBSCRIBERS, EMITTERS } from './service-bus-test-entities';

export class SimpleBackoffRetryTaskContainer {

  @QueueEmitter(EMITTERS.TEST_QUEUE_3)
  backoffRetryEmitter: Sender;

  constructor(public readonly store: MessageStorage) { }

  @Queue({ ...SUBSCRIBERS.TEST_QUEUE_3, receiveMode: ReceiveMode.peekLock })
  @SbIntercept(new SbBackoffRetry({ retryCount: 2, factor: 1, delayType: 'linear', onBackoffMaxRetry: 'complete' }))
  backoffRetry = (source: Observable<SbContext>) => source
    .pipe(
      tap( context => {
        this.store.add(context);
      }),
    )
}
