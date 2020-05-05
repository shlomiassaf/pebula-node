import { Module, Global } from '@nestjs/common';
import { ServiceBusController } from './controllers';
import { ConfigService, ServiceBusEmitClient, ServiceBusEntityConfigurator, MessageStorage } from './services';
import { createServiceBusModule } from './init/service-bus-setup';

const serviceBus = createServiceBusModule();

@Global()
@Module({
  providers: [ ConfigService ],
  exports: [ ConfigService ],
})
class NestBusSharedModule {

}

@Module({
  imports: [
    NestBusSharedModule,
    ...serviceBus.imports,
  ],
  controllers: [
    ServiceBusController,
  ],
  providers: [
    MessageStorage,
    ServiceBusEmitClient,
    ServiceBusEntityConfigurator,
    ...serviceBus.providers,
  ]
})
export class NesBusTestModule {
  
}
