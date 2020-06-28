import { Injectable } from '@nestjs/common';
import { MessageStorage as _MessageStorage } from '../../../__env'

@Injectable()
export class MessageStorage extends _MessageStorage {

}
