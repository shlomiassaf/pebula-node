// TODO: ON_ATOM_IS_PUBLIC
// When `@azure/service-bus` will officially release their Atom management client, follow an refactor all
// TODO with "ON_ATOM_IS_PUBLIC" next to them. See https://github.com/Azure/azure-sdk-for-js/issues/1057
// ALSO: Make sure to:
//  - "yarn remove @azure/core-amqp"
//  - "yearn remove @azure/core-http"
import { ServiceBusAtomManagementClient } from './atom-client/src/serviceBusAtomManagementClient';
import { ServiceBusAtomManagementClientOptions } from './atom-client/src/serviceBusAtomManagementClient';

import { SbManagementClientAdapter, SbConnectionOptions, ServiceBusConnectionStringCredentials, SbManagementDefaultsAdapter } from '../interfaces';
import { SbQueue, SbTopic, SbSubscription, SbRule } from '../models';

// TODO: ON_ATOM_IS_PUBLIC
export interface SbManagementClientAtomOptions
  extends SbConnectionOptions<ServiceBusConnectionStringCredentials, ServiceBusAtomManagementClientOptions> {
  defaults?: SbManagementDefaultsAdapter;
}

export class SbManagementClientAtomAdapter implements SbManagementClientAdapter {
  private readonly managementClient: ServiceBusAtomManagementClient;

  constructor(options: SbManagementClientAtomOptions) {
    const { credentials } = options;
    this.managementClient = new ServiceBusAtomManagementClient(credentials.connectionString, options.options);
  }

  async getQueue(queueName: string) {
    return this.managementClient.getQueueDetails(queueName);
  }
  async upsertQueue(queueName: string, queue: SbQueue, isNew: boolean) {
    return isNew
      ? this.managementClient.createQueue(queueName, queue)
      : this.managementClient.updateQueue(queueName, queue)
    ;
  }
  async deleteQueue(queueName: string) {
    await this.managementClient.deleteQueue(queueName);
  }

  async getTopic(topicName: string) {
    return this.managementClient.getTopicDetails(topicName);
  }
  async upsertTopic(topicName: string, topic: SbTopic, isNew: boolean) {
    return isNew
      ? this.managementClient.createTopic(topicName, topic)
      : this.managementClient.updateTopic(topicName, topic)
    ;
  }
  async deleteTopic(topicName: string) {
    await this.managementClient.deleteTopic(topicName);
  }

  async getSubscription(topicName: string, subscriptionName: string) {
    return this.managementClient.getSubscriptionDetails(topicName, subscriptionName);
  }
  async upsertSubscription(topicName: string, subscriptionName: string, subscription: SbSubscription, isNew: boolean) {
    return isNew
      ? this.managementClient.createSubscription(topicName, subscriptionName, subscription)
      : this.managementClient.updateSubscription(topicName, subscriptionName, subscription)
    ;
  }
  async deleteSubscription(topicName: string, subscriptionName: string) {
    await this.managementClient.deleteSubscription(topicName, subscriptionName);
  }

  async getRule(topicName: string, subscriptionName: string, ruleName: string) {
    return this.managementClient.getRuleDetails(topicName, subscriptionName, ruleName);
  }
  async upsertRule(topicName: string, subscriptionName: string, ruleName: string, rule: SbRule, isNew: boolean) {
    return isNew
      ? this.managementClient.createRule(topicName, subscriptionName, ruleName, rule)
      : this.managementClient.updateRule(topicName, subscriptionName, ruleName, rule)
    ;
  }
  async deleteRule(topicName: string, subscriptionName: string, ruleName: string) {
    await this.managementClient.deleteRule(topicName, subscriptionName, ruleName);
  }
}
