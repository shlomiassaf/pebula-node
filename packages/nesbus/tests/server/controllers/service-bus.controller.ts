import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Controller } from '@nestjs/common';
import { Queue, Subscription, SbContext, SbIntercept } from '@pebula/nesbus';
import { SbBackoffRetry } from '@pebula/nesbus/tasks';
import { MessageStorage, SUBSCRIBERS } from '../services';

@Controller()
export class ServiceBusController {

  constructor(private readonly store: MessageStorage) { }

  @Queue(SUBSCRIBERS.TEST_QUEUE_1)
  testQueue1 = (source: Observable<SbContext>) => source
    .pipe(
      tap( ctx => this.store.add(ctx.getMessage()) )
    )

  @Subscription(SUBSCRIBERS.TEST_SUB_1)
  testTopic1Subscription1 = (source: Observable<SbContext>) => source
      .pipe(
        tap( ctx => this.store.add(ctx.getMessage()) )
      )
}
