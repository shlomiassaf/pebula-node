import { Injectable } from '@nestjs/common';

import * as C from '../../../__env/containers';

import { MessageStorage } from '../services';

@Injectable()
export class SimpleTopicAndSubscriptionContainer extends C.SimpleTopicAndSubscriptionContainer {
  constructor(store: MessageStorage) { super(store); }
}
