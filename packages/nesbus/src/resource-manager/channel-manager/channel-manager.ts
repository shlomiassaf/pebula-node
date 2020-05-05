import { Sender, Receiver, ServiceBusClient, ReceiveMode, SessionReceiverOptions, SessionReceiver } from '@azure/service-bus';

import { SbResourceGroup } from '../resource-group';
import { SbChannelManagerContainerStore } from './channel-manager-container-store';

export class SbChannelManager {
  private rxClient: ServiceBusClient;
  private txClient: ServiceBusClient;
  private containers = new SbChannelManagerContainerStore();

  constructor(public readonly resourceGroup: SbResourceGroup) { }

  async destroy() {
    await this.containers.destroy();
    if (this.rxClient) {
      await this.rxClient.close();
    }
    if (this.txClient && this.txClient !== this.rxClient) {
      await this.txClient.close();
    }
  }

  resourceUpdate(): void {
    const { server, client } = this.resourceGroup;

    this.rxClient = server ? server.client : client.client;
    this.txClient = client ? client.client : server.client;
    this.containers.updateClients(this.rxClient, this.txClient);
  }

  getQueryReceiver(name: string): Receiver | SessionReceiver | undefined {
    const queueContainer = this.containers.findQueue(name);
    if (queueContainer) {
      return queueContainer.receiver;
    }
  }

  getCreateQueryReceiver(name: string, receiveMode: ReceiveMode): Receiver;
  getCreateQueryReceiver(name: string, receiveMode: ReceiveMode, sessionReceiverOptions: SessionReceiverOptions): SessionReceiver;
  getCreateQueryReceiver(name: string, receiveMode: ReceiveMode, sessionReceiverOptions?: SessionReceiverOptions): Receiver | SessionReceiver {
    return this.containers.findQueue(name, true).getCreateReceiver(receiveMode, sessionReceiverOptions);
  }

  getQuerySender(name: string): Sender | undefined {
    const queueContainer = this.containers.findQueue(name);
    if (queueContainer) {
      return queueContainer.sender;
    }
  }

  getCreateQuerySender(name: string): Sender {
    return this.containers.findQueue(name, true).getCreateSender();
  }

  getTopicSender(name: string): Sender | undefined {
    const topicContainer = this.containers.findTopic(name);
    if (topicContainer) {
      return topicContainer.sender;
    }
  }

  getCreateTopic(topicName: string): Sender {
    return this.containers.findTopic(topicName, true).getCreateSender();
  }

  getSubscription(topicName: string, subscriptionName: string): Receiver | SessionReceiver | undefined {
    const topicContainer = this.containers.findTopic(topicName);
    if (topicContainer) {
      return topicContainer.getReceiver(subscriptionName);
    }
  }

  getCreateSubscription(topicName: string, subscriptionName: string, receiveMode: ReceiveMode): Receiver;
  getCreateSubscription(topicName: string,
                        subscriptionName: string,
                        receiveMode: ReceiveMode,
                        sessionReceiverOptions: SessionReceiverOptions): SessionReceiver;
  getCreateSubscription(topicName: string,
                        subscriptionName: string, receiveMode: ReceiveMode,
                        sessionReceiverOptions?: SessionReceiverOptions): Receiver | SessionReceiver {
    return this.containers.findTopic(topicName, true)
      .getCreateReceiver(subscriptionName, receiveMode, sessionReceiverOptions);
  }

}
