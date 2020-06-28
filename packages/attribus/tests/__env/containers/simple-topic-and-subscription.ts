import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Sender } from '@azure/service-bus';
import { Subscription, SbContext, Topic } from '@pebula/attribus';

import { MessageStorage } from '../services';
import { SUBSCRIBERS, EMITTERS } from './service-bus-test-entities';

export class SimpleTopicAndSubscriptionContainer {

  @Topic(EMITTERS.TEST_TOPIC_1)
  topicSubscriptionMethodEmitter: Sender;

  @Topic(EMITTERS.TEST_TOPIC_2)
  topicSubscriptionPipeEmitter: Sender;

  constructor(public readonly store: MessageStorage) { }

  @Subscription<MethodDecorator>(SUBSCRIBERS.TEST_SUB_1_1)
  async topicSubscriptionMethod(context: SbContext) {
    this.store.add(context);
  }

  @Subscription(SUBSCRIBERS.TEST_SUB_2_1)
  topicSubscriptionPipe = (source: Observable<SbContext>) => source
    .pipe(
      tap( async context => this.store.add(context) ),
    )
}
