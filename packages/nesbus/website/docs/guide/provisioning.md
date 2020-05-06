---
id: provisioning
title: Provisioning
sidebar_label: 6. Provisioning
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AzureDocsLink from '@site/src/theme/AzureDocsLink';
import ApiDocsLink from '@site/src/theme/ApiDocsLink';

Provisioning adds management capabilities over your service bus entities.

If you try to register to a queue, topic or subscription that does not exist, service bus will throw an error.
With provision enabled, you can instruct **nestbus** to verify (eager, on load) that the entity exist and if not create it.

## Basic Provisioning

The most basic provision configuration is to decide what level of provisioning are we doing:

- **skip** [default] - provision is disabled
- **verify** - verify entity exists when the server bootstraps, throw if it does not exist (eager check)
- **verifyCreate** - verify entity exists when the server bootstraps, create the entity if it does not exists

```typescript
@Controller()
export class ServiceBusController {
  @Queue<MethodDecorator>(({
    name: 'nesbus-queue.demo',
    provision: 'verifyCreate' // or 'skip' or 'verify'
  })
  async myQueueEntity(@Ctx() context: SbContext) { }
}
```

This is a valid configuration but it is not enough by itself.

What happens when the library detects that an entity does not exist and it needs to create it?
Creating a new service bus entity require additional configuration.

Moreover, the configuration we need is based on the type of the entity, i.e. creating a `subscription` is different than creating a `queue`.

:::info
That being said, setting `provision: 'verifyCreate'` is a valid definition with the help of a small adapter, more on this in a couple of paragraphs.
:::

## Management Clients

Verifying and/or creating entities requires management capabilities so we can create/update entities in service bus.
To enable provisioning we must provide a management configuration otherwise it is disabled.

There are currently 2 management clients available:

### ARM Client

The official service bus management package offered by azure, when using this client you must install the package:

<Tabs defaultValue="yarn" values={[
  { label: 'Yarn', value: 'yarn', },
  { label: 'NPM', value: 'npm', },
]}>

<TabItem value="yarn">

```bash
$ yarn add @azure/arm-servicebus
```

</TabItem>

<TabItem value="npm">

```bash
$ npm install @azure/arm-servicebus
```

</TabItem>
</Tabs>

Then configure the management client when registering the module we need to provide the management
configuration <ApiDocsLink type="interface" symbol="SbManagementClientArmOptions"></ApiDocsLink>:

```ts
import { ApplicationTokenCredentials } from '@azure/ms-rest-nodeauth';
import { Module } from '@nestjs/common';
import { ServiceBusModule, SbServerOptions } from '@pebula/nesbus';

const sbServerOptions: SbServerOptions[] = [
  {
    client: { /* Client configuration options... */ },
    management: {
      credentials: {
        host: 'my-service-bus.servicebus.windows.net,
        resourceGroupName: 'NorthEurope',
        namespace: 'my-service-bus',
        subscriptionId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        credentials: new ApplicationTokenCredentials(
          'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // clientId,
          'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // tenantId,
          'K2.329cnlw3293:#@Mc2EK#)CKE', // clientSecret,
        ),
      },
    },
  },
];

@Module({
  imports: [
    ServiceBusModule.register({ servers: sbServerOptions }),
  ],
})
export class AppModule {}
```

:::tip
In this example, the credentials used are `ApplicationTokenCredentials` but you can use any token credentials object
which implements the `getToken()` interface.

In most cases, one of the following from the `@azure/ms-rest-nodeauth` package:

- ApplicationTokenCredentials
- UserTokenCredentials
- DeviceTokenCredentials
- MSITokenCredentials Token audience (or resource in case of MSI based credentials) to use when creating the credentials is https://servicebus.azure.net/

For more details see the API Docs for <ApiDocsLink type="interface" symbol="ServiceBusManagementAadTokenCredentials"></ApiDocsLink> 
:::

:::warning
`@azure/arm-servicebus` supports authentication & authorization through azure active directory.

This has 2 limitations:

- You will need to manage permissions through azure's role based authorization model.
- You can not use connection strings to connect to service bus.
:::

### ATOM Client (experimental)

The ATOM Client is a management client the uses and authentication and authorization model based on a connection string, which is not possible
when using the `@azure/arm-servicebus` library.

The client is in development by the `@azure/service-bus` team and is planned to release with the `@azure/service-bus` pacakge.

The client itself is operational but not publicly exposed.

To allow using it today, **nesbus** includes a copy of the ATOM client from the `@azure/service-bus` repository, with no changes.
Once officially released the copy will be removed and the original ATOM client will be used instead. If things go as planned
this will go unnoticed, without breaking changes.

```ts
import { Module } from '@nestjs/common';
import { ServiceBusModule, SbServerOptions } from '@pebula/nesbus';

const sbServerOptions: SbServerOptions[] = [
  {
    client: { /* Client configuration options... */ },
    management: {
      credentials: {
        connectionString: 'MY-SAS-CONNECTION-STRING',
      },
    },
  },
];

@Module({
  imports: [
    ServiceBusModule.register({ servers: sbServerOptions }),
  ],
})
export class AppModule {}
```

## Entity Creation Configuration

Instead of setting `provision: 'verifyCreate'` we can set `provision` to an object that contains the configuration required when creating an entity:

```typescript
@Controller()
export class ServiceBusController {
  @Queue<MethodDecorator>(({
    name: 'nesbus-queue.demo',
    provision: {
      type: 'verifyCreate',
      params: { /* Default, entity specific, values */
        deadLetteringOnMessageExpiration: true,
        maxSizeInMegabytes: 1024,
        defaultMessageTtl: 'P14D',
        lockDuration: 'PT5M',
      }
      /* ... Additional, entity specific, provisioning values */
    }
  })
  async myQueueEntity(@Ctx() context: SbContext) { }
}
```

### Params

The **params** property is an object that defines the default values that each entity instance will have when created.

This type differs based on the provision context, i.e. the decorator used.

- For Queue see <AzureDocsLink type="arm" symbol="SBQueue"></AzureDocsLink>
- For Topic see <AzureDocsLink type="arm" symbol="SBTopic"></AzureDocsLink>
- For Subscription see <AzureDocsLink type="arm" symbol="SBSubscription"></AzureDocsLink>

### Additional Provision Configuration

The additional provision configuration also depends on the entity being provisioned.

For example, a **Subscription** is a child entity of **Topic**, you can create a nested provision option
to also run a provision to make sure that the topic exists.

See the API docs for more details:

- <ApiDocsLink type="interface" symbol="SbQueueEntityProvision"></ApiDocsLink>
- <ApiDocsLink type="interface" symbol="SbTopicEntityProvision"></ApiDocsLink>
- <ApiDocsLink type="interface" symbol="SbTopicSubscriptionEntityProvision"></ApiDocsLink>
- <ApiDocsLink type="interface" symbol="SbRuleEntityProvision"></ApiDocsLink>

## Entity Configuration Adapter

We've started with a simple provision definition: `provision: 'verifyCreate'`.
In most cases, our entities will have the same setup, wouldn't it be great to have all of this set from one place and use
the simple definition?

We can do this by providing an special adapter that the management client will use, when creating new entities.

We register the adapter along with the management options we provide when registering a management client:

```ts
import { Module } from '@nestjs/common';
import { ServiceBusModule, SbServerOptions, SbManagementDefaultsAdapter } from '@pebula/nesbus';

const defaults: SbManagementDefaultsAdapter = { /* ... */ };

const sbServerOptions: SbServerOptions[] = [
  {
    client: { /* Client configuration options... */ },
    management: {
      credentials: {
        connectionString: 'MY-SAS-CONNECTION-STRING',
      },
      defaults, // Here we register the default configuration for entities.
    },
  },
];

@Module({
  imports: [
    ServiceBusModule.register({ servers: sbServerOptions }),
  ],
})
export class AppModule {}
```

The adapter contains an `entities` property, with a definition for each type of entity:

```typescript
  entities?: {
    queue?: SbQueue;
    topic?: SbTopic;
    subscription?: SbSubscription;
  };
```

These values will go to the `params` property in the provision definition.

In addition, an optional handler can be set to handle the creation of new rules when a new subscription is created.

For more information, read the API Docs for <ApiDocsLink type="interface" symbol="SbManagementDefaultsAdapter"></ApiDocsLink>


