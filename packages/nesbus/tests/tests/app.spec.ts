import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Sender } from '@azure/service-bus';
import { INestApplication, INestMicroservice, Controller, Injectable } from '@nestjs/common';
import { Queue, Subscription, Ctx, SbContext, QueueEmitter, Topic, SbIntercept } from '@pebula/nesbus';
import { SbBackoffRetry } from '@pebula/nesbus/tasks';

import { MessageStorage, SUBSCRIBERS, EMITTERS } from '../server';
import { TestMessage, TestModuleFactory } from '../utils';

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
  testQueue1: Sender;

  @QueueEmitter(EMITTERS.TEST_QUEUE_2)
  testQueue2: Sender;

  @QueueEmitter(EMITTERS.TEST_QUEUE_3)
  testQueue3: Sender;

  @Topic(EMITTERS.TEST_TOPIC_1)
  testTopic1: Sender;

  @Topic(EMITTERS.TEST_TOPIC_2)
  testTopic2: Sender;
}


describe('@pebula/nesbus', () => {
  // let app: INestMicroservice;
  let app: INestApplication;
  let serviceBusController: ServiceBusController;
  let serviceBusEmitClient: ServiceBusEmitClient;
  let msgStore: MessageStorage;

  beforeAll(async () => {
    jest.setTimeout(10000 * 30);

    app = await TestModuleFactory.create()
      .addServiceBusModule()
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
      .init(4000);

    msgStore = app.get(MessageStorage);
    serviceBusController = app.get(ServiceBusController);
    serviceBusEmitClient = app.get(ServiceBusEmitClient);
  });

  beforeEach(() => {
    msgStore.reset();
  });

  it('should route queue message using method handler', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testQueue1.send(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(1);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should route topic subscriber message using method handler', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testTopic1.send(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(1);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });
  
  it('should route queue message using observable handling', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testQueue2.send(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(1);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should route topic subscriber message using observable handling', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testTopic2.send(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(1);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should activate backoff', async () => {
    const testMessage = TestMessage.getSample();
    await serviceBusEmitClient.testQueue3.send(testMessage);
    const [ receivedMsg ] = await msgStore.waitForCount(4, 1000 * 60);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  afterAll(async () => {
    await app.close();
  });
});
