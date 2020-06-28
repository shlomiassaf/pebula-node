import { Server, CustomTransportStrategy } from '@nestjs/microservices';

export function createServiceBusStrategy() {
  return new NestServiceBusMicroserviceServer();
}

export class NestServiceBusMicroserviceServer extends Server implements CustomTransportStrategy {
  async listen(callback: () => void) {
    callback();
  }

  async close(): Promise<void> {
  }
}
