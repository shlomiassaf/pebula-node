// tslint:disable: max-classes-per-file
import { Sender, Receiver, SessionReceiver, ReceiveMode, SessionReceiverOptions, ServiceBusClient, QueueClient, TopicClient, SubscriptionClient } from '@azure/service-bus';

class TopicSubscriptionClientContainer {
  readonly receiver: Receiver | SessionReceiver;
  private rxQueueClient: SubscriptionClient;

  constructor(public readonly name: string,
              topic: TopicClientContainer,
              receiveMode: ReceiveMode,
              sessionReceiverOptions?: SessionReceiverOptions) {
    this.rxQueueClient = topic.rxClient.createSubscriptionClient(topic.name, this.name);
    this.receiver = sessionReceiverOptions
      ? this.rxQueueClient.createReceiver(receiveMode, sessionReceiverOptions)
      : this.rxQueueClient.createReceiver(receiveMode)
    ;
  }

  async destroy() {
    await this.rxQueueClient.close();
  }
}

export class QueueClientContainer {
  sender?: Sender;
  receiver?: Receiver | SessionReceiver;
  private rxQueueClient: QueueClient;
  private txQueueClient: QueueClient;

  constructor(public readonly name: string,
              public readonly rxClient: ServiceBusClient,
              public readonly txClient: ServiceBusClient) {
  }

  getCreateReceiver(receiveMode: ReceiveMode, sessionReceiverOptions?: SessionReceiverOptions) {
    if (!this.receiver) {
      this.receiver = sessionReceiverOptions
        ? this.queueClient('rx').createReceiver(receiveMode, sessionReceiverOptions)
        : this.queueClient('rx').createReceiver(receiveMode)
      ;
    }
    return this.receiver;
  }

  getCreateSender() {
    if (!this.sender) {
      this.sender = this.queueClient('tx').createSender();
    }
    return this.sender;
  }

  private queueClient(type: 'rx' | 'tx') {
    if (type === 'rx') {
      if (!this.rxQueueClient) {
        this.rxQueueClient = this.rxClient.createQueueClient(this.name);
        if (this.txClient === this.rxClient) {
          this.txQueueClient = this.rxQueueClient;
        }
      }
      return this.rxQueueClient;
    } else {
      if (!this.txQueueClient) {
        this.txQueueClient = this.txClient.createQueueClient(this.name);
        if (this.txClient === this.rxClient) {
          this.rxQueueClient = this.txQueueClient;
        }
      }
      return this.txQueueClient;
    }
  }

  async destroy() {
    if (this.rxQueueClient) {
      await this.rxQueueClient.close();
    }
    if (this.txQueueClient && this.txQueueClient !== this.rxQueueClient) {
      await this.txQueueClient.close();
    }
  }
}

export class TopicClientContainer {
  readonly subscriptions = new Map<string, TopicSubscriptionClientContainer>();
  sender?: Sender;
  private txQueueClient: TopicClient;

  constructor(public readonly name: string,
              public readonly rxClient: ServiceBusClient,
              public readonly txClient: ServiceBusClient) { }

  getCreateSender() {
    if (!this.sender) {
      this.sender = this.txClient.createTopicClient(this.name).createSender();
    }
    return this.sender;
  }

  getReceiver(subscriptionName: string): Receiver | SessionReceiver | undefined {
    const subscriber = this.subscriptions.get(subscriptionName);
    if (subscriber) {
      return subscriber.receiver;
    }
  }

  getCreateReceiver(subscriptionName: string, receiveMode: ReceiveMode, sessionReceiverOptions?: SessionReceiverOptions) {
    if (!this.subscriptions.has(subscriptionName)) {
      this.subscriptions.set(subscriptionName, new TopicSubscriptionClientContainer(subscriptionName, this, receiveMode, sessionReceiverOptions));
    }
    return this.subscriptions.get(subscriptionName).receiver;
  }

  async destroy() {
    if (this.txQueueClient) {
      await this.txQueueClient.close();
    }
    const subscriptions = Array.from(this.subscriptions.values());
    this.subscriptions.clear();

    for (const client of subscriptions) {
      await client.destroy();
    }
  }
}
