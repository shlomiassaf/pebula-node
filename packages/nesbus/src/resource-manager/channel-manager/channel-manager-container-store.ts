import { ServiceBusClient } from '@azure/service-bus';
import { QueueClientContainer, TopicClientContainer, TopicSubscriptionClientContainer } from './client-container';

export class SbChannelManagerContainerStore {
  private queueClients = new Map<string | symbol, QueueClientContainer>();
  private topicClients = new Map<string | symbol, TopicClientContainer>();

  private rxClient: ServiceBusClient;
  private txClient: ServiceBusClient;

  updateClients(rx: ServiceBusClient, tx: ServiceBusClient): void {
    this.rxClient = rx;
    this.txClient = tx;
    // TODO: go over all containers (queue/topic/topic-subscriber) and update clients
    // based on previous reference match (throw if no match to previous)
  }

  findSubscription(topicContainer: TopicClientContainer,
                   subscriptionName: string,
                   createIfNotExists: false | 'rx' | 'tx' = false): TopicSubscriptionClientContainer | undefined {
    let subscriptionClientContainer = topicContainer.subscriptions.get(subscriptionName);

    if (!subscriptionClientContainer && createIfNotExists !== false) {
      const client = this.withClient(createIfNotExists).createSubscriptionClient(topicContainer.name, subscriptionName);
      subscriptionClientContainer = new TopicSubscriptionClientContainer(topicContainer, subscriptionName, client);
      topicContainer.subscriptions.set(subscriptionName, subscriptionClientContainer);
    }
    return subscriptionClientContainer;
  }

  findQueue(queueName: string, createIfNotExists: false | 'rx' | 'tx' = false): QueueClientContainer | undefined {
    let queueContainer = this.queueClients.get(queueName);
    if (!queueContainer && createIfNotExists !== false) {
      const client = this.withClient(createIfNotExists).createQueueClient(queueName);
      queueContainer = new QueueClientContainer(queueName, client);
      this.queueClients.set(queueName, queueContainer);
    }
    return queueContainer;
  }

  findTopic(topicName: string, createIfNotExists: false | 'rx' | 'tx' = false): TopicClientContainer | undefined {
    let topicContainer = this.topicClients.get(topicName);
    if (!topicContainer && createIfNotExists !== false) {
      const client = this.withClient(createIfNotExists).createTopicClient(topicName);
      topicContainer = new TopicClientContainer(topicName, client);
      this.topicClients.set(topicName, topicContainer);
    }
    return topicContainer;
  }

  private withClient(client: 'rx' | 'tx'): ServiceBusClient {
    return client === 'rx' ? this.rxClient : this.txClient;
  }
}
