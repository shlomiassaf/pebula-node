---
id: introduction
title: Introduction
sidebar_label: 1. Introduction
---
import DocLink from '@site/src/theme/DocLink';

**AttriBus** (Attribute Driven ServiceBus) is a library that provide the tools to create an attribute driven service bus architecture.
It simplifies how we use and manage service bus through an declarative API that automate message handling & emitter registration:

You can work with **AttriBus** as is but you can also plug it in to **NestJS** as a microservice, enjoying all the goodies of the framework.

`@pebula/attribus/nestjs` is a microservice extension for **NestJS** that adds support for Azure Service Bus within **NestJS** in a
simple and intuitive way.

It simplifies how we use and manage service bus through an declarative API that automate message handling & emitter registration:

### Message Handling

Handling incoming service bus message is now as easy as handling incoming REST requests.

```typescript
@Controller() // can also be @Injectable
export class ServiceBusController {
  @Queue<MethodDecorator>(({
    name: 'nesbus-queue.demo'
  })
  async myQueueEntity(context: SbContext) {
  }
}
```

### Client Emitters

Defining service bus emitters (`Sender`) requires no logic, you can compose a client emitter in seconds:

```typescript
@Injectable() // does not have to be separate, you can have both subscriber and emitter in the same container.
export class ServiceBusEmitClient {

  @QueueEmitter({
    name: 'nesbus-queue.demo'
  })
  myQueueEntity: Sender;
}
```

Working with `@pebula/attribus/nestjs` is very similar to working with `@pebula/attribus`.

- With NestJS we take advantage of the dependency injection system to register entities (emitters & subscribers).
- The initialization process is also bound the module system provided by NestJS.
- By using DI we can now load entity configuration (metadata) later in the process, in an async manner.
