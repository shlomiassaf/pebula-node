import { SendableMessageInfo, ServiceBusMessage } from '@azure/service-bus';
import { INestApplication } from '@nestjs/common';

import { SbErrorHandler } from '@pebula/attribus';
import { SbBackoffRetry } from '@pebula/attribus/tasks';

import { TestMessage, EMITTERS, TestErrorHandler, IncomingMessageRecord, promiser } from '../__env';
import {
  MessageStorage,
  TestModuleFactory,
  SimpleQueueContainer, SimpleTopicAndSubscriptionContainer, SimpleBackoffRetryTaskContainer,
  TestMetadataTransformer
} from './__env';

describe('@pebula/attribus/nestjs', () => {
  // let app: INestMicroservice;
  let app: INestApplication;

  beforeAll(async () => {
    jest.setTimeout(10000 * 30);

    app = await TestModuleFactory.create()
      .addServiceBusModule(
        {},
        {
          metadataTransformer: TestMetadataTransformer,
          providers: [
            {
              provide: SbErrorHandler,
              useClass: TestErrorHandler,
            }
          ]
        })
      .addMetadata({
        controllers: [
          SimpleQueueContainer, SimpleBackoffRetryTaskContainer,
        ],
        providers: [
          SimpleTopicAndSubscriptionContainer,
          TestMetadataTransformer,
          SbBackoffRetry,
        ],
      })
      .compile()
      .init(4004);
  });

  afterEach(() => {
    app.get<SbErrorHandler, TestErrorHandler>(SbErrorHandler).reset();
    app.get(MessageStorage).reset();
  });

  it('should reflect initial route commit & registration errors', () => {
    const errorHandler: TestErrorHandler = app.get(SbErrorHandler);
    expect(errorHandler.lastError.length).toBe(1);
    expect(errorHandler.lastError[0].options.name).toBe('INVALID');
    expect(errorHandler.lastError[0].error.message).toBe('Swallowing error is not allowed when "autoComplete" is enabled in "peekLock" mode.');
  });

  it('should route queue message using method handler', async () => {
    let testMessage: SendableMessageInfo;
    const simpleQueueContainer = app.get(SimpleQueueContainer);
    const receivedMsg = await simpleQueueContainer.store.sendMessageAndWait(simpleQueueContainer.queueMethodEmitter, m => testMessage = m);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should emit message errors from the error handler', async () => {
    let testMessage: SendableMessageInfo;
    const simpleQueueContainer = app.get(SimpleQueueContainer);
    const error = new Error('123');
    const receivedMsg = await simpleQueueContainer.store.sendMessageAndWait(
      simpleQueueContainer.queueMethodSwallowErrorEmitter,
      m => testMessage = m,
      m => {
        throw error;
      },
    );
    TestMessage.checkMessageContents(testMessage, receivedMsg);

    const errorHandler: TestErrorHandler = app.get(SbErrorHandler);
    expect(errorHandler.lastMessageError.length).toBe(1);
    expect(errorHandler.lastMessageError[0].error).toBe(error);
  });

  it('should complete the message even when error thrown because swallowErrors is set to swallowAndAutoComplete', async () => {
    let testMessage: SendableMessageInfo;
    const simpleQueueContainer = app.get(SimpleQueueContainer);
    const error = new Error('123');
    const receivedMsg = await simpleQueueContainer.store.sendMessageAndWait(
      simpleQueueContainer.queueMethodSwallowErrorEmitter,
      m => testMessage = m,
      m => {
        throw error;
      },
    );
    TestMessage.checkMessageContents(testMessage, receivedMsg);
    await new Promise( r => setTimeout(r, 1000));
    expect(receivedMsg.msg.delivery.settled).toBe(true);
  });


  it('should route queue message using observable handling', async () => {
    let testMessage: SendableMessageInfo;
    const simpleQueueContainer = app.get(SimpleQueueContainer);
    const receivedMsg = await simpleQueueContainer.store.sendMessageAndWait(simpleQueueContainer.queuePipeEmitter, m => testMessage = m);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should route topic subscriber message using method handler', async () => {
    let testMessage: SendableMessageInfo;
    const simpleTopicAndSubscriptionContainer = app.get(SimpleTopicAndSubscriptionContainer);
    const receivedMsg = await simpleTopicAndSubscriptionContainer.store.sendMessageAndWait(simpleTopicAndSubscriptionContainer.topicSubscriptionMethodEmitter, m => testMessage = m);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should route topic subscriber message using observable handling', async () => {
    let testMessage: SendableMessageInfo;
    const simpleTopicAndSubscriptionContainer = app.get(SimpleTopicAndSubscriptionContainer);
    const receivedMsg = await simpleTopicAndSubscriptionContainer.store.sendMessageAndWait(simpleTopicAndSubscriptionContainer.topicSubscriptionPipeEmitter, m => testMessage = m);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should meta-transform the metadata', async () => {
    let testMessage: SendableMessageInfo;
    const testMetadataTransformer = app.get(TestMetadataTransformer);
    const receivedMsg = await app.get(MessageStorage).sendMessageAndWait(testMetadataTransformer.testQueueNotExists, m => testMessage = m);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
    expect(receivedMsg.metadata.name).toBe(EMITTERS.TEST_QUEUE_2.name);
  });

  it('should activate backoff', async () => {
    const simpleBackoffRetryTaskContainer = app.get(SimpleBackoffRetryTaskContainer);
    const p = promiser<void>();
    const messages: IncomingMessageRecord['msg'][] = [];
    let testMessage: SendableMessageInfo;

    const isBackoffRetry = (incomingMsg: IncomingMessageRecord) => incomingMsg.msg.correlationId === testMessage.correlationId

    const handler = (msg: ServiceBusMessage) => {
      messages.push({ ...msg, userProperties: { ...(msg.userProperties || {}) } } as any);

      if (messages.length < 3) {
        simpleBackoffRetryTaskContainer.store.waitForMessage(isBackoffRetry, handler).catch(err => { p.reject(err); })
        throw new Error('backoff');
      } else {
        const onMessage = simpleBackoffRetryTaskContainer.store.waitForMessage(
          isBackoffRetry,
          lastMsg => {
            clearTimeout(cancel);
            messages.push(lastMsg);
            p.resolve();
          }
        );
        const cancel = setTimeout(() => {
          onMessage.catch(() => {});
          simpleBackoffRetryTaskContainer.store.abort(onMessage);
          p.resolve();
        }, 5000);
        throw new Error('backoff');
      }
    }

    const receivedMsg = await simpleBackoffRetryTaskContainer.store.sendMessageAndWait(
      simpleBackoffRetryTaskContainer.backoffRetryEmitter,
      record => testMessage = record,
      handler
    );

    await p.promise;
    TestMessage.checkMessageContents(testMessage, receivedMsg);
    expect(messages.length).toBe(3);
    expect(messages[0].userProperties.hasOwnProperty('SB_BACKOFF_RETRY_COUNT')).toBe(false);
    for (let i = 1; i < messages.length; i++) {
      expect(messages[i].userProperties.SB_BACKOFF_RETRY_COUNT).toBe(i);
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
