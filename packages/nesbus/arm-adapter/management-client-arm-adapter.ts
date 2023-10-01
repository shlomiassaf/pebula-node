import { ServiceBusManagementClient, ServiceBusManagementClientOptionalParams } from '@azure/arm-servicebus';
import {
  SbConnectionOptions,
  ServiceBusManagementAadTokenCredentials,
  SbManagementDefaultsAdapter,
  SbManagementClientAdapter,
} from '../src/interfaces';
import { SbQueue, SbTopic, SbSubscription, SbRule } from '../src/models';
import { convertFromRule, convertToSubscription, convertToRule, convertToTopic, convertToQueue } from './management-client-arm-adapter-converters';

export interface SbManagementClientArmOptions
  extends SbConnectionOptions<ServiceBusManagementAadTokenCredentials, ServiceBusManagementClientOptionalParams> {
  defaults?: SbManagementDefaultsAdapter;
}

export class SbManagementClientArmAdapter implements SbManagementClientAdapter {
  readonly resourceGroupName: string;
  readonly namespace: string;
  private readonly managementClient: ServiceBusManagementClient;

  constructor(options: SbManagementClientArmOptions) {
    const { credentials } = options;
    this.resourceGroupName = credentials.resourceGroupName;
    this.namespace = credentials.namespace;

    this.managementClient = new ServiceBusManagementClient(
      credentials.credentials as any, // TODO: Remove any when https://github.com/Azure/azure-sdk-for-js/issues/8041
      credentials.subscriptionId,
      options.options,
    );
  }

  async getQueue(queueName: string): Promise<SbQueue> {
    const result = await this.managementClient.queues.get(this.resourceGroupName, this.namespace, queueName);
    return convertToQueue(result);
  }
  async upsertQueue(queueName: string, queue: SbQueue, isNew: boolean): Promise<SbQueue> {
    const result = await this.managementClient.queues.createOrUpdate(this.resourceGroupName, this.namespace, queueName, queue);
    return convertToQueue(result);
  }
  async deleteQueue(queueName: string) {
    await this.managementClient.queues.delete(this.resourceGroupName, this.namespace, queueName);
  }

  async getTopic(topicName: string): Promise<SbTopic> {
    const result = await this.managementClient.topics.get(this.resourceGroupName, this.namespace, topicName);
    return convertToTopic(result);
  }
  async upsertTopic(topicName: string, topic: SbTopic, isNew: boolean): Promise<SbTopic> {
    const result = await this.managementClient.topics.createOrUpdate(this.resourceGroupName, this.namespace, topicName, topic);
    return convertToTopic(result);
  }
  async deleteTopic(topicName: string) {
    await this.managementClient.topics.delete(this.resourceGroupName, this.namespace, topicName);
  }

  async getSubscription(topicName: string, subscriptionName: string): Promise<SbSubscription> {
    const result = await this.managementClient.subscriptions.get(this.resourceGroupName, this.namespace, topicName, subscriptionName);
    return convertToSubscription(result);
  }
  async upsertSubscription(topicName: string, subscriptionName: string, subscription: SbSubscription, isNew: boolean): Promise<SbSubscription> {
    const result = await this.managementClient.subscriptions
      .createOrUpdate(this.resourceGroupName, this.namespace, topicName, subscriptionName, subscription);
    return convertToSubscription(result);
  }
  async deleteSubscription(topicName: string, subscriptionName: string) {
    await this.managementClient.subscriptions.delete(this.resourceGroupName, this.namespace, topicName, subscriptionName);
  }

  async getRule(topicName: string, subscriptionName: string, ruleName: string): Promise<SbRule> {
    return convertToRule(
      ruleName,
      await this.managementClient.rules.get(this.resourceGroupName, this.namespace, topicName, subscriptionName, ruleName),
    );
  }
  async upsertRule(topicName: string, subscriptionName: string, ruleName: string, rule: SbRule, isNew: boolean): Promise<SbRule> {
    const armRule = await this.managementClient.rules.createOrUpdate(
      this.resourceGroupName,
      this.namespace,
      topicName,
      subscriptionName,
      ruleName,
      convertFromRule(rule),
    );
    return convertToRule(ruleName, armRule);
  }
  async deleteRule(topicName: string, subscriptionName: string, ruleName: string) {
    await this.managementClient.rules.delete(this.resourceGroupName, this.namespace, topicName, subscriptionName, ruleName);
  }

}
