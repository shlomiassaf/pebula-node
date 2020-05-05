import { ReceiveMode } from '@azure/service-bus';
import { Injectable, Optional } from '@nestjs/common';
import {
  SbQueueEmitterMetadataOptions,
  SbTopicMetadataOptions,
  SbQueueMetadataOptions,
  SbSubscriptionMetadataOptions,
  SbEntityProvisionOption,
} from '@pebula/nesbus';

export const SERVICE_BUS_ENTITY_NAMES = {
  Q: {
    TEST_QUEUE_1: 'test.queue.1',
  },
  T: {
    TEST_TOPIC_1: {
      name: 'test.topic.1',
      S: {
        TEST_SUB_1: 'test.sub.1',
      }
    },
  }, 
};

Object.freeze(SERVICE_BUS_ENTITY_NAMES);

@Injectable()
export class ServiceBusEntityConfigurator {

  constructor(@Optional() private defaultProvision: SbEntityProvisionOption<any> = 'verifyCreate') {
  }

  emitter<T extends SbQueueEmitterMetadataOptions | SbTopicMetadataOptions>(meta: T): T {
    return {...this.base(), ...meta };
  }

  subscriber<T extends SbQueueMetadataOptions | SbSubscriptionMetadataOptions>(meta: T): T {
    return {...this.base(), ...meta };
  }

  private base() {
    return {
      provision: this.defaultProvision,
    };
  }
}

export function normalizeSubscriber<T extends SbQueueMetadataOptions | SbSubscriptionMetadataOptions>(meta: T) {
  return (config: ServiceBusEntityConfigurator) => config.subscriber(meta);
}

export const SUBSCRIBERS = {
  normalize: normalizeSubscriber,
  TEST_QUEUE_1: normalizeSubscriber({
    name: SERVICE_BUS_ENTITY_NAMES.Q.TEST_QUEUE_1,
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: {
      autoComplete: true,
    },
  }),
  TEST_SUB_1: normalizeSubscriber({
    name: SERVICE_BUS_ENTITY_NAMES.T.TEST_TOPIC_1.S.TEST_SUB_1,
    topicName: SERVICE_BUS_ENTITY_NAMES.T.TEST_TOPIC_1.name,
    receiveMode: ReceiveMode.peekLock,
    handlerOptions: {
      autoComplete: true,
    },
  }),
};

export function normalizeEmitter<T extends SbQueueEmitterMetadataOptions | SbTopicMetadataOptions>(meta: T) {
  return (config: ServiceBusEntityConfigurator) => config.emitter(meta);
}

export const EMITTERS = {
  normalize: normalizeEmitter,
  TEST_QUEUE_1: normalizeEmitter({ name: SERVICE_BUS_ENTITY_NAMES.Q.TEST_QUEUE_1 }),
  TEST_TOPIC_1: normalizeEmitter({ name: SERVICE_BUS_ENTITY_NAMES.T.TEST_TOPIC_1.name }),
};
