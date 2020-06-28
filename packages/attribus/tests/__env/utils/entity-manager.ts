import { Extensibility, SbQueue, SbTopic, SbSubscription, SbQueueEntityProvision, SbTopicEntityProvision, SbTopicSubscriptionEntityProvision } from '@pebula/attribus';
import { sbResourceManager } from '../../../src/resource-manager/resource-manager';
import { SbConfigurator } from '../../../src/management/configurator';
import { SbChannelManager } from '../../../src/resource-manager/channel-manager/channel-manager';
import { ServiceBusAtomManagementClient } from '../../../src/atom-adapter/atom-client/src/serviceBusAtomManagementClient';
import { MessageCountDetails } from '../../../src/atom-adapter/atom-client/src/util/utils';

export abstract class EntityManager<T extends SbQueue | SbTopic | SbSubscription = SbQueue | SbTopic | SbSubscription,
                                    TMeta extends Extensibility.SbEmitterMetadata | Extensibility.SbSubscriberMetadata = Extensibility.SbEmitterMetadata | Extensibility.SbSubscriberMetadata> {
  static create(metadata: Extensibility.SbEmitterMetadata | Extensibility.SbSubscriberMetadata,
                managementClient: ServiceBusAtomManagementClient) {
    switch (metadata.type) {
      case 'queue':
        return new QueueEntityManager(metadata, managementClient);
      case 'topic':
        return new TopicEntityManager(metadata, managementClient);
      case 'subscription':
        return new SubscriptionEntityManager(metadata, managementClient);
    }
  }

  get entityName() { return this.metadata.metaOptions.name; }

  public readonly metadata: TMeta;

  protected configurator: SbConfigurator;
  protected channelMgr: SbChannelManager;

  constructor(metadata: Extensibility.SbEmitterMetadata | Extensibility.SbSubscriberMetadata,
              protected readonly managementClient: ServiceBusAtomManagementClient) { 
    this.metadata = metadata as any;
    if (metadata instanceof Extensibility.SbEmitterMetadata) {
      this.channelMgr = sbResourceManager.getChannelManager(metadata.metaOptions.clientId);  
      this.configurator = this.channelMgr.resourceGroup.client.configurator;
    } else {
      this.channelMgr = sbResourceManager.getChannelManager(metadata.metaOptions.serverId);  
      this.configurator = this.channelMgr.resourceGroup.server.configurator;
    }
  }

  abstract async get(): Promise<T>;

  abstract async exists(): Promise<boolean>;

  abstract async delete(): Promise<boolean>;

  abstract async upsert(entity?: T): Promise<T>;

  abstract async recreate(entity?: T): Promise<T>;

  abstract async getMessageCountDetails(): Promise<MessageCountDetails>;
}

export class QueueEntityManager extends EntityManager<SbQueue, Extensibility.SbEmitterMetadata<'queue'> | Extensibility.SbSubscriberMetadata<'queue'>> {

  async get() {
    return this.configurator.managementClient.getQueue(this.entityName);
  }

  async exists() {
    try {
      const result = await this.configurator.managementClient.getQueue(this.entityName);
      return !!result;
    } catch (err) {
      return false;
    }
  }

  async delete() {
    try {
      await this.configurator.managementClient.deleteQueue(this.entityName);
      return true;
    } catch (err) {
      return false;
    }
  }

  async upsert(entity?: SbQueue) {
    const { provision } = this.metadata.metaOptions;
    const result: SbQueueEntityProvision = typeof provision === 'string' ? { type: provision } as any : { ...(provision || {}) };
    result.type = 'verifyCreate';
    if (entity) {
      result.params = entity;
    }
    return this.configurator.verifyQueue(this.entityName, result, true)
  }
  
  async recreate(entity?: SbQueue) {
    const exists = await this.exists();
    if (exists) {
      await this.delete();
    }
    return this.upsert(entity);
  }
  
  async getMessageCountDetails() {
    const { messageCountDetails } = await this.managementClient.getQueueDetails(this.entityName);
    return messageCountDetails;    
  }
}


export class TopicEntityManager extends EntityManager<SbTopic, Extensibility.SbEmitterMetadata<'topic'>> {

  async get() {
    return this.configurator.managementClient.getTopic(this.entityName);
  }

  async exists() {
    try {
      const result = await this.configurator.managementClient.getTopic(this.entityName);
      return !!result;
    } catch (err) {
      return false;
    }
  }

  async delete() {
    try {
      await this.configurator.managementClient.deleteTopic(this.entityName);
      return true;
    } catch (err) {
      return false;
    }
  }

  async upsert(entity?: SbTopic) {
    const { provision } = this.metadata.metaOptions;
    const result: SbTopicEntityProvision = typeof provision === 'string' ? { type: provision } as any : { ...(provision || {}) };
    result.type = 'verifyCreate';
    if (entity) {
      result.params = entity;
    }
    return this.configurator.verifyTopic(this.entityName, result, true)
  }

  async recreate(entity?: SbTopic) {
    const exists = await this.exists();
    if (exists) {
      await this.delete();
    }
    return this.upsert(entity);
  }
  
  async getMessageCountDetails() {
    const { messageCountDetails } = await this.managementClient.getTopicDetails(this.entityName);
    return messageCountDetails;   
  }
}


export class SubscriptionEntityManager extends EntityManager<SbQueue, Extensibility.SbSubscriberMetadata<'subscription'>> {

  async get() {
    const { topicName, name } = this.metadata.metaOptions;
    return this.configurator.managementClient.getSubscription(topicName, name);
  }

  async exists() {
    try {
      const { topicName, name } = this.metadata.metaOptions;
      const result = await this.configurator.managementClient.getSubscription(topicName, name);
      return !!result;
    } catch (err) {
      return false;
    }
  }

  async delete() {
    try {
      const { topicName, name } = this.metadata.metaOptions;
      await this.configurator.managementClient.deleteSubscription(topicName, name);
      return true;
    } catch (err) {
      return false;
    }
  }

  async upsert(entity?: SbSubscription) {
    const { topicName, name } = this.metadata.metaOptions;
    const { provision } = this.metadata.metaOptions;
    const result: SbTopicSubscriptionEntityProvision = typeof provision === 'string' ? { type: provision } as any : { ...(provision || {}) };
    result.type = 'verifyCreate';
    if (entity) {
      result.params = entity;
    }
    return this.configurator.verifySubscription(topicName, name, result, true)
  }

  async recreate(entity?: SbTopic) {
    const exists = await this.exists();
    if (exists) {
      await this.delete();
    }
    return this.upsert(entity);
  }
  
  async getMessageCountDetails() {
    const { topicName, name } = this.metadata.metaOptions;
    const { messageCountDetails } = await this.managementClient.getSubscriptionDetails(topicName, name);
    return messageCountDetails;  
  }
}