---
id: introduction
title: Introduction
sidebar_label: 1. Introduction
---
import DocLink from '@site/src/theme/DocLink';

**NesBus** (Nest / Service Bus) is a microservice extension for **NestJS** that adds support for Azure Service Bus within **NestJS** in a
simple and intuitive way.

It simplifies how we use and manage service bus through an declarative API that automate message handling & emitter registration:

### Message Handling

Handling incoming service bus message is now as easy as handling incoming REST requests.

```typescript
@Controller()
export class ServiceBusController {
  @Queue<MethodDecorator>(({
    name: 'nesbus-queue.demo'
  })
  async myQueueEntity(@Ctx() context: SbContext) {
  }
}
```

### Client Emitters

Defining service bus emitters (`Sender`) requires no logic, you can compose a client emitter in seconds:

```typescript
@Injectable()
export class ServiceBusEmitClient {

  @QueueEmitter({
    name: 'nesbus-queue.demo'
  })
  myQueueEntity: Sender;
}
```

### Easy Setup

The library also helps with service bus entity management through a declarative API for automatic creation
of service bus entities based on the entities we define in the controllers / services in our application.

We call it **provision**. [<DocLink to="docs/guide/provisioning">Read more...</DocLink>]

This allows a **code-first** approach for service bus management and architecture.

### Leverage Advanced Architecture Patterns

By simplifying the work with service bus, **Nesbus** enables the use of more advanced architecture patterns that you
can use to manage the flow of your application.

Using **Observables** you can now implement a **CQRS** or **Event Sourcing** models out of the box.
In addition, **Observables** along with **Interceptors** allow us to use plugins that encapsulate behaviors for us.

For example, the **<DocLink to="docs/tasks/back-off">SbBackoffRetry plugin</DocLink>** wraps incoming service bus messages and handles them when their handler throws.
It will perform a retry to handle them again but with a delay between each try. The delay is not constant and it is based on an algorithm (linear / exponential)
so the effect of periodic stress on you server is reduced.

## NOTE: @azure/service-bus@7

:::info
`@pebula/nesbus` supports `@azure/service-bus@1.1.6`.

The azure team is currently working on a re-redesigned library, currently in preview (`7.0.0-preview.2`).
Once version 7 becomes official, `@pebula/nesbus` will support it, with limited backward compatibility to v1 (critical bugs only).

Since version 7 comes with significant breaking changes you should expect some changes in nesbus as well while
some will not get noticed due to the abstraction.
:::
