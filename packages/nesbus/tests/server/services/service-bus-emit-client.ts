import { Sender } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';
import { QueueEmitter, Topic } from '@pebula/nesbus';
import { EMITTERS } from './service-bus-entity-configurator';

@Injectable()
export class ServiceBusEmitClient {

  @QueueEmitter(EMITTERS.TEST_QUEUE_1)
  testQueue1: Sender;

  @Topic(EMITTERS.TEST_TOPIC_1)
  testTopic1: Sender;
}
