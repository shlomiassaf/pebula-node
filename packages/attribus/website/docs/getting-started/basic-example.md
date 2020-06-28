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
    { label: 'attribus.manager.ts', value: 'attribus.manager.ts', },
  ]
}>

<TabItem value="main.ts">

```typescript title=""main.ts"
import { AttribusManager } from './attribus.manager';

async function main() {
  const manager = new AttribusManager();
  await manager.start();

  // When done:
  await manager.close();
}

main().catch( e => console.log(e));

```

</TabItem>

<TabItem value="attribus.manager.ts">

```typescript title="attribus.manager.ts"
import { AttribusManagerBase, SbServerOptions } from '@pebula/attribus';
import { ServiceBusReceiveClient } from './receive.client.ts';
import { ServiceBusEmitClient } from './emit.client.ts';

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

export class AttribusManager extends AttribusManagerBase {

  public readonly serviceBusReceiveClient = new ServiceBusReceiveClient();
  public readonly serviceBusEmitClient = new ServiceBusEmitClient();

  protected async getConfiguration(): Promise<AttribusConfiguration> {
    return {
      containers: [this.serviceBusReceiveClient, this.serviceBusEmitClient],
      servers: createServerOptions(new ConfigService())
    }
  }
}
```

</TabItem>

</Tabs>

## Client (emitting)

```typescript title="emit.client.ts"
import { Sender } from '@azure/service-bus';
import { QueueEmitter, Topic } from '@pebula/attribus';

export class ServiceBusEmitClient {

  @QueueEmitter({
    name: 'attribus-queue.demo'
  })
  myQueueEntity: Sender;

  @Topic({
    name: 'attribus-topic.demo'
  })
  myTopicEntity: Sender;
}
```

After you add this to your module `providers` list you can import it anywhere in your app and start emitting to service bus.

## Server (receiving)

```typescript title="receive.client.ts"
import { Queue, Subscription, Ctx, SbContext } from '@pebula/attribus';

export class ServiceBusReceiveClient {

  @Queue<MethodDecorator>({
    name: 'attribus-queue.demo',
    handlerOptions: {
      autoComplete: false,
    },
  })
  async myQueueEntity(context: SbContext) {
    await context.getMessage().complete();
  }

  @Subscription<MethodDecorator>(({
    name: 'attribus-topic.demo'
  })
  async myTopicEntity(context: SbContext) {
  }

}
```

Same way you define your REST routes... Bind a handler function to an incoming channel.

### Using Reactive Handlers

```typescript title="receive.streamed.client.ts"
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Queue, Subscription, SbContext } from '@pebula/attribus';

export class ServiceBusReceiveClient {

  @Queue({
    name: 'attribus-queue.demo',
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
    name: 'attribus-topic.demo'
  })
  myTopicEntity = (source: Observable<SbContext>) => source
    .pipe(
      tap( async context => {

      }),
    )
}
```

Using reactive handlers to chain the logic of your application.

This design allows using **AttriBus** interceptors which act as plugins and can add a lot of functionality to your code with little effort.
