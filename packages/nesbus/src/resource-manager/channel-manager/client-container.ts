// tslint:disable: max-classes-per-file
import { ServiceBusClient, ServiceBusSessionReceiverOptions, ServiceBusReceiver, ServiceBusSessionReceiver, ServiceBusSender, ServiceBusReceiverOptions } from '@azure/service-bus';

class TopicSubscriptionClientContainer {
  readonly receiver: ServiceBusReceiver | ServiceBusSessionReceiver;
  
  constructor(public readonly name: string,
              topic: TopicClientContainer,
              receiveMode: 'peekLock' | 'receiveAndDelete',
              receiverOptions?: ServiceBusSessionReceiverOptions | ServiceBusReceiverOptions) {
    this.receiver = receiverOptions
      ? topic.rxClient.createReceiver(topic.name, receiveMode, {...receiverOptions, receiveMode})
      : topic.rxClient.createReceiver(topic.name, receiveMode, { receiveMode })
    ;
  }

  async destroy() {
    await this.receiver.close();
  }
}

export class QueueClientContainer {
  sender?: ServiceBusSender;
  receiver?: ServiceBusReceiver | ServiceBusSessionReceiver;

  constructor(public readonly name: string,
              public readonly rxClient: ServiceBusClient,
              public readonly txClient: ServiceBusClient) {
  }

  getCreateReceiver(receiveMode: 'peekLock' | 'receiveAndDelete', receiverOptions?: ServiceBusSessionReceiverOptions | ServiceBusReceiverOptions) {
    if (!this.receiver) {
      this.receiver = receiverOptions
          ? this.rxClient.createReceiver(this.name, {...receiverOptions, receiveMode })
          : this.rxClient.createReceiver(this.name, { receiveMode })
      ;
    }
    return this.receiver;
  }

  getCreateSender() {
    if (!this.sender) {
      this.sender = this.txClient.createSender(this.name);
    }
    return this.sender;
  }

  async destroy() {
    if (this.sender) {
      await this.sender.close();
    }
    if (this.receiver) {
      await this.receiver.close();
    }
  }
}

export class TopicClientContainer {
  readonly subscriptions = new Map<string, TopicSubscriptionClientContainer>();
  sender?: ServiceBusSender;

  constructor(public readonly name: string,
              public readonly rxClient: ServiceBusClient,
              public readonly txClient: ServiceBusClient) { }

  getCreateSender() {
    if (!this.sender) {
      this.sender = this.txClient.createSender(this.name);
    }
    return this.sender;
  }

  getReceiver(subscriptionName: string): ServiceBusReceiver | ServiceBusSessionReceiver | undefined {
    const subscriber = this.subscriptions.get(subscriptionName);
    if (subscriber) {
      return subscriber.receiver;
    }
  }

  getCreateReceiver(subscriptionName: string, receiveMode: 'peekLock' | 'receiveAndDelete', receiverOptions?: ServiceBusSessionReceiverOptions | ServiceBusReceiverOptions) {
    if (!this.subscriptions.has(subscriptionName)) {
      this.subscriptions.set(subscriptionName, new TopicSubscriptionClientContainer(subscriptionName, this, receiveMode, receiverOptions));
    }
    return this.subscriptions.get(subscriptionName).receiver;
  }

  async destroy() {
    if (this.sender) {
      await this.sender.close();
    }
    const subscriptions = Array.from(this.subscriptions.values());
    this.subscriptions.clear();

    for (const client of subscriptions) {
      await client.destroy();
    }
  }
}
