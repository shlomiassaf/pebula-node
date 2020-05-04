// tslint:disable: max-classes-per-file
import { Sender, Receiver, QueueClient, SubscriptionClient, TopicClient, SessionReceiver } from '@azure/service-bus';

export class QueueClientContainer {
  sender?: Sender;
  receiver?: Receiver | SessionReceiver;
  constructor(public readonly name: string, public readonly client: QueueClient) { }
}

export class TopicClientContainer {
  readonly subscriptions = new Map<string, TopicSubscriptionClientContainer>();
  sender?: Sender;
  constructor(public readonly name: string, public readonly client: TopicClient) { }
}

export class TopicSubscriptionClientContainer {
  receiver?: Receiver | SessionReceiver;
  constructor(public readonly parent: TopicClientContainer,
              public readonly name: string,
              public readonly client: SubscriptionClient) { }
}
