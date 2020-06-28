import { Sender } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';
import { QueueEmitter, MetadataTransformer, SbQueueMetadataOptions } from '@pebula/attribus/nestjs';

import { EMITTERS } from '../../../__env/containers/service-bus-test-entities';
import { NESTJS_EMITTERS } from '../containers/nestjs-test-entities';

@Injectable()
export class TestMetadataTransformer implements MetadataTransformer {
  @QueueEmitter(NESTJS_EMITTERS.TEST_QUEUE_NOT_EXISTS)
  testQueueNotExists: Sender;

  async queue(target: any, key: string | symbol, options: SbQueueMetadataOptions) {
    if (options.name === NESTJS_EMITTERS.TEST_QUEUE_NOT_EXISTS.name) {
      options.name = EMITTERS.TEST_QUEUE_2.name;
    }
  }
}
