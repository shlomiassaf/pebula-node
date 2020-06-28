---
id: dynamic-entity-configuration
title: Dynamic Entity Configuration
sidebar_label: 1. Dynamic Entity Configuration
---

You can apply some flexibility on how the entity configuration is defined.

Let's see an example:

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
}
```

The entity `nesbus-queue.demo` is defined statically. We will need to apply these to all of our entities.

Since most entities probably share the same configuration, especially when provisioning is enabled, it will be helpful if we
can centralize the static metadata into a single location where we can apply default values, assist a configuration service
or download a manifest from a server, and use one or all of these techniques to define the entity.

### MetadataTransformer

`MetadataTransformer` is an interface which we can provide that will allow editing or replacing the configuration metadata provided for each entity.

```typescript
export interface MetadataTransformer {
  queueSubscription?(target: any, key: string | symbol, options: SbQueueSubscriptionMetadataOptions): Promise<SbQueueSubscriptionMetadataOptions | void>;
  topicSubscription?(target: any, key: string | symbol, options: SbSubscriptionMetadataOptions): Promise<SbSubscriptionMetadataOptions | void>;
  queue?(target: any, key: string | symbol, options: SbQueueMetadataOptions): Promise<SbQueueMetadataOptions | void>;
  topic?(target: any, key: string | symbol, options: SbTopicMetadataOptions): Promise<SbTopicMetadataOptions | void>;
}
```

Each method will be invoked based on the entity being registered. You can return a new options object or edit the values in place.

:::info
Note that this phase is not ment for registering or verifying the entity configuration, it is here to allow flexibility with entity configuration.
:::

To instruct the library to use a metadata transformer, you need to provide it when registering the modile:

```typescript
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

@Module({
  imports: [
    ServiceBusModule.register({
      servers: sbServerOptions,
      metadataTransformer: { /* transformer implementation here... */ }
    }),
  ],
})
export class AppModule {}
```

**metadataTransformer** accepts `Provider<MetadataTransformer>` (Provider from `@nestjs/common`) but without
the `provide` token which the library will set internally. This means you can use a factory, direct value, a class etc...