---
id: basic-example
title: Basic Usage
sidebar_label: 3. Basic Usage
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Configuration

<Tabs defaultValue="main.ts"
  values={[
    { label: 'main.ts', value: 'main.ts', },
    { label: 'app.module.ts', value: 'app.module.ts', },
  ]
}>

<TabItem value="main.ts">

```typescript title=""main.ts"
import { createServiceBusStrategy } from '@pebula/attribus/nestjs';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({ strategy: createServiceBusStrategy() });
  await app.startAllMicroservicesAsync();

  await app.listen(3000);
}
bootstrap();
```

</TabItem>

<TabItem value="app.module.ts">

```typescript title="app.module.ts"
import { Module } from '@nestjs/common';
import { ServiceBusModule, SbServerOptions } from '@pebula/attribus/nestjs';

const sbServerOptions: SbServerOptions[] = [
  {
    client: {
      credentials: {
        connectionString: 'MY_SAS_CONNECTION_STRING',
      },
    },
  },
];
// You can also use active directory credentials...

@Module({
  imports: [
    ServiceBusModule.register({
      servers: sbServerOptions
    }),
  ],
})
export class AppModule {}
```

</TabItem>

</Tabs>

## Client (emitting)

```typescript
import { Injectable } from '@nestjs/common';
import { Sender } from '@azure/service-bus';
import { QueueEmitter, Topic } from '@pebula/attribus/nestjs';

@Injectable()
export class ServiceBusEmitClient {

  @QueueEmitter({
    name: 'nesbus-queue.demo'
  })
  myQueueEntity: Sender;

  @Topic({
    name: 'nesbus-topic.demo'
  })
  myTopicEntity: Sender;
}
```

After you add this to your module `providers` list you can import it anywhere in your app and start emitting to service bus.

## Server (receiving)

```typescript
import { Controller } from '@nestjs/common';
import { Queue, Subscription, SbContext } from '@pebula/attribus/nestjs';

@Controller()
export class ServiceBusController {

  @Queue<MethodDecorator>({
    name: 'nesbus-queue.demo',
    handlerOptions: {
      autoComplete: false,
    },
  })
  async myQueueEntity(context: SbContext) {
    await context.getMessage().complete();
  }

  @Subscription<MethodDecorator>(({
    name: 'nesbus-topic.demo'
  })
  async myTopicEntity(context: SbContext) {
  }

}
```

Same way you define your REST routes... Bind a handler function to an incoming channel.

:::tip
- `@Queue` and/or `@Subscription` does not require a controller, you can define them on an `@Injectable` service, as long as they are part of the DI and you use them.
Controlelrs are eagerly loaded by default, which makes them a good pick.
- You can mix emitter & subscribers on the same container, either injectable or controller and user them. Remember that controllers might be harder to inject
so if you define emitters on them, define only those which you will requires locally in the controller. When emitter are set on a service (injectable) you can easily
inject them into other controllers.
:::

### Using Reactive Handlers

```typescript
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Controller } from '@nestjs/common';
import { Queue, Subscription, SbContext } from '@pebula/attribus/nestjs';

@Controller()
export class ServiceBusController {

  @Queue({
    name: 'nesbus-queue.demo',
    handlerOptions: {
      autoComplete: false,
    },
  })
  myQueueEntity = (source: Observable<SbContext>) => source
    .pipe(
      switchMap( async context => {
        await context.getMessage().complete();
      }),
    )

  @Subscription(({
    name: 'nesbus-topic.demo'
  })
  myTopicEntity = (source: Observable<SbContext>) => source
    .pipe(
      tap( async context => {

      }),
    )
}
```

Using reactive handlers to chain the logic of your application.

This design allows using **nesbus** interceptors which act as plugins and can add a lot of functionality to your code with little effort.

:::tip
The reactive handler pattern works great with the **@nestjs/cqrs** module and in general most of the event driven designs out there.
You can easily implement event sourcing with it.
:::
