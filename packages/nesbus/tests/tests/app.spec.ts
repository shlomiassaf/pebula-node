import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ServiceBusSender } from '@azure/service-bus';
import { INestApplication, INestMicroservice, Controller, Injectable } from '@nestjs/common';
import { Queue, Subscription, Ctx, SbContext, QueueEmitter, Topic, SbIntercept, SbErrorHandler, SbErrorEvent, SbMessageErrorEvent } from '@pebula/nesbus';
import { SbBackoffRetry } from '@pebula/nesbus/tasks';

import { MessageStorage, SUBSCRIBERS, EMITTERS } from '../server';
import { TestMessage, TestModuleFactory } from '../utils';

class TestErrorHandler extends SbErrorHandler {
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

@Controller()
export class ServiceBusController {

  constructor(public readonly store: MessageStorage) { }

  @Queue<MethodDecorator>(SUBSCRIBERS.TEST_QUEUE_1)
  async testQueue1(@Ctx() context: SbContext) {
    this.store.add(context.getMessage());
  }

  @Subscription<MethodDecorator>(SUBSCRIBERS.TEST_SUB_1_1)
  async testTopic1Sub1(@Ctx() context: SbContext) {
    this.store.add(context.getMessage());
  }

  @Queue(SUBSCRIBERS.TEST_QUEUE_2)
  testQueue2 = (source: Observable<SbContext>) => source
    .pipe(
      tap( async context => this.store.add(context.getMessage()) ),
    )

  @Subscription(SUBSCRIBERS.TEST_SUB_2_1)
  testTopic1Sub2 = (source: Observable<SbContext>) => source
    .pipe(
      tap( async context => this.store.add(context.getMessage()) ),
    )

  @Queue(SUBSCRIBERS.TEST_QUEUE_3)
  @SbIntercept(new SbBackoffRetry({ retryCount: 3, factor: 1, delayType: 'linear' }))
  testQueue3 = (source: Observable<SbContext>) => source
    .pipe(
      tap( context => {
        const msg = context.getMessage();
        this.store.add(msg);
        throw new Error('backoff');
      }),
    )
}

@Injectable()
export class ServiceBusEmitClient {

  @QueueEmitter(EMITTERS.TEST_QUEUE_1)
  testQueue1: ServiceBusSender;

  @QueueEmitter(EMITTERS.TEST_QUEUE_2)
  testQueue2: ServiceBusSender;

  @QueueEmitter(EMITTERS.TEST_QUEUE_3)
  testQueue3: ServiceBusSender;

  @Topic(EMITTERS.TEST_TOPIC_1)
  testTopic1: ServiceBusSender;

  @Topic(EMITTERS.TEST_TOPIC_2)
  testTopic2: ServiceBusSender;
}


describe('@pebula/nesbus', () => {
  // let app: INestMicroservice;
  let app: INestApplication;
  let serviceBusController: ServiceBusController;
  let serviceBusEmitClient: ServiceBusEmitClient;
  let errorHandler: TestErrorHandler;
  let msgStore: MessageStorage;

  beforeAll(async () => {
    jest.setTimeout(10000 * 30);

    app = await TestModuleFactory.create()
      .addServiceBusModule({ provide: SbErrorHandler, useClass: TestErrorHandler })
      .addMetadata({
        controllers: [
          ServiceBusController,
        ],
        providers: [
          ServiceBusEmitClient,
          SbBackoffRetry,
        ],
      })
      .compile()
      .init(4001);

    errorHandler = app.get(SbErrorHandler);
    msgStore = app.get(MessageStorage);
    serviceBusController = app.get(ServiceBusController);
    serviceBusEmitClient = app.get(ServiceBusEmitClient);
  });

  beforeEach(() => {
    msgStore.reset();
  });

  it('should route queue message using method handler', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testQueue1.sendMessages(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(1);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should route topic subscriber message using method handler', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testTopic1.sendMessages(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(1);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });
  
  it('should route queue message using observable handling', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testQueue2.sendMessages(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(1);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should route topic subscriber message using observable handling', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testTopic2.sendMessages(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(1);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should activate backoff', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testQueue3.sendMessages(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(4, 1000 * 60);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  afterAll(async () => {
    await app.close();
  });
});
