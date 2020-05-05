import { ReceiveMode } from '@azure/service-bus';

export interface EntityTestEnvSetup {
  entity: 'topic' | 'subscription' | 'queue';
  setup?: boolean;
  teardown?: boolean;
}

declare module '@pebula/nesbus/src/interfaces/subscriber' {
  export interface SbSubscriberMetadataOptions {
    testEnvSetup?: EntityTestEnvSetup;
  }
}

declare module '@pebula/nesbus/src/interfaces/emitter' {
  export interface SbEmitterMetadataOptions {
    testEnvSetup?: EntityTestEnvSetup;
  }
}

const QUEUE = 'queue' as 'queue';
const TOPIC = 'topic' as 'topic';
const SUBSCRIPTION = 'subscription' as 'subscription';

export const SUBSCRIBERS = {
  TEST_QUEUE_1: {
    name: 'test.queue.1',
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: { },
    testEnvSetup: {
      entity: QUEUE,
      setup: true,
      teardown: true,
    },
  },
  TEST_QUEUE_2: {
    name: 'test.queue.2',
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: { },
    testEnvSetup: {
      entity: QUEUE,
      setup: true,
      teardown: true,
    },
  },
  TEST_QUEUE_3: {
    name: 'test.queue.3',
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: { },
    testEnvSetup: {
      entity: QUEUE,
      setup: true,
      teardown: true,
    },
  },
  TEST_SUB_1_1: {
    name: 'test.sub.1.1',
    topicName: 'test.topic.1',
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: { },
    testEnvSetup: {
      entity: SUBSCRIPTION,
      setup: true,
    },
  },
  TEST_SUB_1_2: {
    name: 'test.sub.1.2',
    topicName: 'test.topic.1',
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: { },
    testEnvSetup: {
      entity: SUBSCRIPTION,
      setup: true,
    },
  },
  TEST_SUB_1_3: {
    name: 'test.sub.1.3',
    topicName: 'test.topic.1',
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: { },
    testEnvSetup: {
      entity: SUBSCRIPTION,
      setup: true,
    },
  },
  TEST_SUB_2_1: {
    name: 'test.sub.2.1',
    topicName: 'test.topic.2',
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: { },
    testEnvSetup: {
      entity: SUBSCRIPTION,
      setup: true,
    },
  },
  TEST_SUB_2_2: {
    name: 'test.sub.2.2',
    topicName: 'test.topic.2',
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: { },
    testEnvSetup: {
      entity: SUBSCRIPTION,
      setup: true,
    },
  },
  TEST_SUB_2_3: {
    name: 'test.sub.2.3',
    topicName: 'test.topic.2',
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: { },
    testEnvSetup: {
      entity: SUBSCRIPTION,
      setup: true,
    },
  },
};

export const EMITTERS = {
  TEST_QUEUE_1: {
    name: SUBSCRIBERS.TEST_QUEUE_1.name,
  },
  TEST_QUEUE_2: {
    name: SUBSCRIBERS.TEST_QUEUE_2.name,
  },
  TEST_QUEUE_3: {
    name: SUBSCRIBERS.TEST_QUEUE_3.name,
  },
  TEST_TOPIC_1: {
    name: SUBSCRIBERS.TEST_SUB_1_1.topicName,
    testEnvSetup: {
      entity: TOPIC,
      setup: true,
      teardown: true,
    },
  },
  TEST_TOPIC_2: {
    name: SUBSCRIBERS.TEST_SUB_2_1.topicName,
    testEnvSetup: {
      entity: TOPIC,
      setup: true,
      teardown: true,
    },
  },
};

