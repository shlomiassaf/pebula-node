import { Controller } from '@nestjs/common';

import * as C from '../../../__env/containers';

import { MessageStorage } from '../services';

@Controller()
export class SimpleQueueContainer extends C.SimpleQueueContainer {
  constructor(store: MessageStorage) { super(store); }
}
