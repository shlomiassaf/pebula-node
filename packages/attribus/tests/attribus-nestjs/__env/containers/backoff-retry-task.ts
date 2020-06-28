import { Controller } from '@nestjs/common';

import * as C from '../../../__env/containers';

import { MessageStorage } from '../services';

@Controller()
export class SimpleBackoffRetryTaskContainer extends C.SimpleBackoffRetryTaskContainer {
  constructor(store: MessageStorage) { super(store); }
}
