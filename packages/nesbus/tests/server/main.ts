import { NestFactory } from '@nestjs/core';
import { createSbServer } from '@pebula/nesbus';

import { NesBusTestModule } from './test.module';

async function bootstrap() {
  const app = await NestFactory.create(NesBusTestModule);

  app.connectMicroservice({ strategy: createSbServer() });
  await app.startAllMicroservicesAsync();

  await app.listen(3000);
}
bootstrap();
