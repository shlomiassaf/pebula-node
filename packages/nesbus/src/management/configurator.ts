import { LoggerService } from '@nestjs/common';
import {
  SbServerOptions,
  SbEntityProvision,
  SbEntityProvisionOption,
  SgEntityProvisionType,
  SbQueueEntityProvision,
  SbTopicEntityProvision,
  SbTopicSubscriptionEntityProvision,
  SbRuleEntityProvision,
  SbManagementDefaultsAdapter,
  SbLinkedEntityProvisionOption,
  SbManagementClientAdapter,
  SbClientOptions,
} from '../interfaces';
import { NoopLogger } from '../noop-logger';
import { SbQueue, SbTopic, SbSubscription, SbRule } from '../models';
import { normalizeDefaults, resolveRules } from './defaults';

const noopLogger = new NoopLogger();

function uniqueKey(...keys: string[]): string {
  return keys.join(':');
}

async function safeAsync<T>(task: Promise<T>, fallback = null): Promise<T | null> {
  try {
    return await task;
  } catch (err) {
    return fallback;
  }
}

export class SbConfigurator {
  private sbLogger: LoggerService = noopLogger;

  private readonly cache = {
    queue: new Map<string, SbQueue>(),
    topic: new Map<string, SbTopic>(),
    subscription: new Map<string, SbSubscription>(),
    rule: new Map<string, SbRule>(),
  };

  private defaults: SbManagementDefaultsAdapter;

  constructor(public readonly managementClient: SbManagementClientAdapter, options: SbServerOptions | SbClientOptions) {
    if (options.logger) {
      this.sbLogger = options.logger;
    }
    this.defaults = normalizeDefaults((options.management as any).defaults);
  }

  async verifyQueue(queueName: string, provision: SbEntityProvisionOption<SbQueueEntityProvision>): Promise<SbQueue> {
    // check if already verified for this connector...
    if (this.cache.queue.has(queueName)) {
      return;
    }

    provision = this.normalizeEntityProvision(provision, this.defaults.entities.queue);

    if (provision.type === 'skip') {
      return;
    }

    let queue = await safeAsync(this.managementClient.getQueue(queueName));
    if (this.shouldCreate(queue, provision.type)) {
      queue = await this.managementClient.upsertQueue(queueName, provision.params, !queue);
    }

    // Add to cache so we won' verify this one again.
    if (queue) {
      this.cache.queue.set(queueName, queue);
    }

    if (queue) {
      await this.resolveLinkedEntity(queue.forwardDeadLetteredMessagesTo, provision, provision.deadLetter, this.defaults.entities);
      await this.resolveLinkedEntity(queue.forwardTo, provision, provision.forward, this.defaults.entities);
    }

    this.sbLogger.log(`Queue ${queueName} verified.`);
    return queue;
  }

  async verifyTopic(topicName: string, provision: SbEntityProvisionOption<SbTopicEntityProvision>): Promise<SbTopic> {
    // check if already verified for this connector...
    if (this.cache.topic.has(topicName)) {
      return this.cache.topic.get(topicName);
    }
    provision = this.normalizeEntityProvision(provision, this.defaults.entities.topic);

    if (provision.type === 'skip') {
      return;
    }

    let topic: SbTopic = await safeAsync(this.managementClient.getTopic(topicName));
    if (this.shouldCreate(topic, provision.type)) {
      topic = await this.managementClient.upsertTopic(topicName, provision.params, !topic);
    }

    // Add to cache so we won' verify this one again.
    if (topic) {
      this.cache.topic.set(topicName, topic);
    }

    this.sbLogger.log(`Topic ${topicName} verified.`);
    return topic;
  }

  async verifySubscription(topicName: string,
                           subscriptionName: string,
                           provision: SbEntityProvisionOption<SbTopicSubscriptionEntityProvision>): Promise<SbSubscription> {
    const uniqueName = uniqueKey(topicName, subscriptionName);
    // check if already verified for this connector...
    if (this.cache.subscription.has(uniqueName)) {
      return this.cache.subscription.get(uniqueName);
    }
    provision = this.normalizeEntityProvision(provision, this.defaults.entities.subscription);

    if (provision.type === 'skip') {
      return;
    }

    if (provision.topic) {
      await this.verifyTopic(topicName, provision.topic);
    }

    let subscription: SbSubscription = await safeAsync(this.managementClient.getSubscription(topicName, subscriptionName));
    if (this.shouldCreate(subscription, provision.type)) {
      subscription = await this.managementClient.upsertSubscription(topicName, subscriptionName, provision.params, !subscription);
    }

    // Add to cache so we won' verify this one again.
    if (subscription) {
      this.cache.subscription.set(uniqueName, subscription);
    }

    if (subscription) {
      await this.resolveLinkedEntity(subscription.forwardDeadLetteredMessagesTo, provision, provision.deadLetter, this.defaults.entities);
      await this.resolveLinkedEntity(subscription.forwardTo, provision, provision.forward, this.defaults.entities);
    }

    const rules = resolveRules(topicName, subscriptionName, provision, this.defaults);
    if (rules.length > 0) {
      const rulesAsync = rules.map( r => this.verifyRule(topicName, subscriptionName, r));
      await Promise.all(rulesAsync);
    }

    this.sbLogger.log(`Subscription ${topicName}-${subscriptionName} verified.`);
    return subscription;
  }

  async verifyRule(topicName: string, subscriptionName: string, provision: SbRuleEntityProvision): Promise<SbRule> {
    const { ruleName } = provision;
    const uniqueName = uniqueKey(topicName, subscriptionName, ruleName);

    // check if check if already verified for this connector...
    if (this.cache.rule.has(uniqueName)) {
      return this.cache.rule.get(uniqueName);
    } else if (provision.type === 'skip') {
      return;
    }

    let rule: SbRule = await safeAsync(this.managementClient.getRule(topicName, subscriptionName, ruleName));
    if (this.shouldCreate(rule, provision.type)) {
      rule = await this.managementClient.upsertRule(topicName, subscriptionName, ruleName, provision.params, !rule);
    }

    // Add to cache so we won' verify this one again.
    if (rule) {
      this.cache.rule.set(uniqueName, rule);
    }

    return rule;
  }

  /**
   * Returns true when the subscription provision has a dependency, which is a topic
   */
  subscriptionHasDependency(provision?: SbEntityProvisionOption<SbTopicSubscriptionEntityProvision>) {
    provision = this.normalizeEntityProvision(provision || 'skip', this.defaults.entities.subscription);

    if (provision.type !== 'skip' && provision.topic) {
      const topicProvision = this.normalizeEntityProvision(provision.topic, this.defaults.entities.topic);
      return topicProvision.type !== 'skip';
    }
    return false;
  }

  private async resolveLinkedEntity(
    entityName: string,
    parentProvision: SbEntityProvision<any>,
    linkedEntity: SbLinkedEntityProvisionOption,
    defaults: SbManagementDefaultsAdapter['entities'],
  ): Promise<Exclude<SbLinkedEntityProvisionOption['provision'], SgEntityProvisionType>> {

    if (entityName && linkedEntity) {
      if (linkedEntity.type === 'queue') {
        const defaultParams = defaults[linkedEntity.type];
        const linkedProvision = this.normalizeEntityProvision(linkedEntity.provision || parentProvision.type, defaultParams);
        await this.verifyQueue(entityName, linkedProvision);
        return linkedProvision;
      } else {
        const defaultParams = defaults[linkedEntity.type];
        const linkedProvision = this.normalizeEntityProvision(linkedEntity.provision || parentProvision.type, defaultParams);
        await this.verifyTopic(entityName, linkedProvision);
        return linkedProvision;
      }
    }
  }

  private normalizeEntityProvision<Z, T extends SbEntityProvision<Z>>(provision: SbEntityProvisionOption<T>,
                                                                      defaults: Z): T {
    const result: T = typeof provision === 'string' ? { type: provision } as any : { ...provision };

    if (result.type === 'verifyCreate') {
      result.params = { ...defaults, ...(result.params || {} as any) };
    }

    return result;
  }

  private shouldCreate<T>(result: T, provisionType: SbEntityProvision<any>['type']): boolean {
    return !result && provisionType === 'verifyCreate';
  }
}
