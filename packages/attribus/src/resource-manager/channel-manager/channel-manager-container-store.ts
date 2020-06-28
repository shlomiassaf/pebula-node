import { ServiceBusClient } from '@azure/service-bus';
import { QueueClientContainer, TopicClientContainer } from './client-container';

export class SbChannelManagerContainerStore {
  private queueClients = new Map<string | symbol, QueueClientContainer>();
  private topicClients = new Map<string | symbol, TopicClientContainer>();

  private rxClient: ServiceBusClient;
  private txClient: ServiceBusClient;

  async destroy() {
    const clients = [...this.queueClients.values(), ...this.topicClients.values()];
    this.queueClients.clear();
    this.topicClients.clear();
    for (const client of clients) {
      await client.destroy();
    }
  }

  updateClients(rx: ServiceBusClient, tx: ServiceBusClient): void {
    this.rxClient = rx;
    this.txClient = tx;
    // TODO: go over all containers (queue/topic/topic-subscriber) and update clients
    // based on previous reference match (throw if no match to previous)
  }

  findQueue(queueName: string, createIfNotExists = false): QueueClientContainer | undefined {
    let queueContainer = this.queueClients.get(queueName);
    if (!queueContainer && createIfNotExists) {
      queueContainer = new QueueClientContainer(queueName, this.rxClient, this.txClient);
      this.queueClients.set(queueName, queueContainer);
    }
    return queueContainer;
  }

  findTopic(topicName: string, createIfNotExists = false): TopicClientContainer | undefined {
    let topicContainer = this.topicClients.get(topicName);
    if (!topicContainer && createIfNotExists) {
      topicContainer = new TopicClientContainer(topicName, this.rxClient, this.txClient);
      this.topicClients.set(topicName, topicContainer);
    }
    return topicContainer;
  }
}
