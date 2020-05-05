---
id: introduction
title: Introduction
sidebar_label: 1. Introduction
---

**NesBus** (Nest / Service Bus) is a microservice extension for **NestJS** that adds support for Azure Service Bus within **NestJS** in a
simple and intuitive way.

### Message Handling

Handling incoming service bus message is now as easy as handling incoming REST requests.

```typescript
@Controller()
export class ServiceBusController {
  @Subscription<MethodDecorator>(({
    name: 'nesbus-topic.demo'
  })
  async myTopicEntity(@Ctx() context: SbContext) {
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

