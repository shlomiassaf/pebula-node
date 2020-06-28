import { Module, Global } from '@nestjs/common';
import { ConfigService, MessageStorage } from './services';

@Global()
@Module({
  providers: [ ConfigService, MessageStorage ],
  exports: [ ConfigService, MessageStorage ],
})
export class NestBusSharedModule {

}
