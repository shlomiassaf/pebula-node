import { ServiceBusMessage, SendableMessageInfo } from '@azure/service-bus';
import { promiser, TestMessage, IncomingMessageRecord, AttribusManager } from '../__env';

describe('@pebula/attribus', () => {
  const att: AttribusManager = new AttribusManager();

  beforeAll(async () => {
    jest.setTimeout(10000 * 30);
    await att.start();
  });

  afterEach(() => {
    att.errorHandler.reset();
    att.msgStore.reset();
  });

  it('should reflect initial route commit & registration errors', () => {
    expect(att.errorHandler.lastError.length).toBe(1);
    expect(att.errorHandler.lastError[0].options.name).toBe('INVALID');
    expect(att.errorHandler.lastError[0].error.message).toBe('Swallowing error is not allowed when "autoComplete" is enabled in "peekLock" mode.');
  });

  it('should route queue message using method handler', async () => {
    let testMessage: SendableMessageInfo;
    const entityManager = att.managementUtils.entityManager<'queue'>(att.simpleQueueContainer.queueMethodEmitter);
    const countCheck = await att.managementUtils.verifyMessageCountUnchanged(entityManager);
    const receivedMsg = await att.msgStore.sendMessageAndWait(att.simpleQueueContainer.queueMethodEmitter, m => testMessage = m);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
    await countCheck();
  });

  it('should emit message errors from the error handler', async () => {
    let testMessage: SendableMessageInfo;
    const error = new Error('123');
    const receivedMsg = await att.msgStore.sendMessageAndWait(
      att.simpleQueueContainer.queueMethodSwallowErrorEmitter,
      m => testMessage = m,
      m => {
        throw error;
      },
    );
    TestMessage.checkMessageContents(testMessage, receivedMsg);
    expect(att.errorHandler.lastMessageError.length).toBe(1);
    expect(att.errorHandler.lastMessageError[0].error).toBe(error);
  });

  it('should complete the message even when error thrown because swallowErrors is set to swallowAndAutoComplete', async () => {
    let testMessage: SendableMessageInfo;
    const error = new Error('123');
    const receivedMsg = await att.msgStore.sendMessageAndWait(
      att.simpleQueueContainer.queueMethodSwallowErrorEmitter,
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
    const receivedMsg = await att.msgStore.sendMessageAndWait(att.simpleQueueContainer.queuePipeEmitter, m => testMessage = m);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should route topic subscriber message using method handler', async () => {
    let testMessage: SendableMessageInfo;
    const receivedMsg = await att.msgStore.sendMessageAndWait(att.simpleTopicAndSubscriptionContainer.topicSubscriptionMethodEmitter, m => testMessage = m);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should route topic subscriber message using observable handling', async () => {
    let testMessage: SendableMessageInfo;
    const receivedMsg = await att.msgStore.sendMessageAndWait(att.simpleTopicAndSubscriptionContainer.topicSubscriptionPipeEmitter, m => testMessage = m);
    TestMessage.checkMessageContents(testMessage, receivedMsg);
  });

  it('should activate backoff', async () => {
    const p = promiser<void>();
    const messages: IncomingMessageRecord['msg'][] = [];
    let testMessage: SendableMessageInfo;

    const isBackoffRetry = (incomingMsg: IncomingMessageRecord) => incomingMsg.msg.correlationId === testMessage.correlationId

    const handler = (msg: ServiceBusMessage) => {
      messages.push({ ...msg, userProperties: { ...(msg.userProperties || {}) } } as any);

      if (messages.length < 3) {
        att.msgStore.waitForMessage(isBackoffRetry, handler).catch(err => { p.reject(err); })
        throw new Error('backoff');
      } else {
        const onMessage = att.msgStore.waitForMessage(
          isBackoffRetry,
          lastMsg => {
            clearTimeout(cancel);
            messages.push(lastMsg);
            p.resolve();
          }
        );
        const cancel = setTimeout(() => {
          onMessage.catch(() => {});
          att.msgStore.abort(onMessage);
          p.resolve();
        }, 5000);
        throw new Error('backoff');
      }
    }

    const receivedMsg = await att.msgStore.sendMessageAndWait(
      att.simpleBackoffRetryTaskContainer.backoffRetryEmitter,
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
    await att.close();
  });
});
