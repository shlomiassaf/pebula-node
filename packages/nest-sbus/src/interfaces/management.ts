import { SbQueue, SbTopic, SbSubscription, SbRule } from '../models';
import { SbRuleEntityProvision, SbTopicSubscriptionEntityProvision } from './entity-provision';

export interface SbManagementClientAdapterFactory {
  supported(options: SbManagementClientManagementAdapters[keyof SbManagementClientManagementAdapters]): boolean;
  create(options: SbManagementClientManagementAdapters[keyof SbManagementClientManagementAdapters]): SbManagementClientAdapter;
}

export interface SbManagementClientAdapter {
  getQueue(queueName: string): Promise<SbQueue>;
  upsertQueue(queueName: string, queue: SbQueue, isNew: boolean): Promise<SbQueue>;

  getTopic(topicName: string): Promise<SbTopic>;
  upsertTopic(topicName: string, topic: SbTopic, isNew: boolean): Promise<SbTopic>;

  getSubscription(topicName: string, subscriptionName: string): Promise<SbSubscription>;
  upsertSubscription(topicName: string, subscriptionName: string, subscription: SbSubscription, isNew: boolean): Promise<SbSubscription>;

  getRule(topicName: string, subscriptionName: string, ruleName: string): Promise<SbRule>;
  upsertRule(topicName: string, subscriptionName: string, ruleName: string, rule: SbRule, isNew: boolean): Promise<SbRule>;
}

export interface SbManagementDefaultsAdapter {
  entities?: {
    queue?: SbQueue;
    topic?: SbTopic;
    subscription?: SbSubscription;
  };

  /**
   * A function that can be used to create default set of rules that will be added when a new subscription is created.
   * This function, when set, is fired at all time even if the user defined a static array or a dynamic function for the rules.
   *
   * If the user provision defines a function for the rules it will be fired first and after that the default rules function will fire.
   *
   * The rules from the user's provision is passed to this function and the result from this function will be used as the resolved rules
   * for the subscription. I.E., for pass-through make sure you return the `providedRules array.
   *
   * @param topicName The name of the topic grandparent
   * @param subscriptionName The name of subscription parent
   * @param providedRules The list of rules defined by the user
   * @param subscriptionProvision The provision of the subscription created
   */
  onNewSubscriptionRules?(topicName: string,
                          subscriptionName: string,
                          providedRules: SbRuleEntityProvision[],
                          subscriptionProvision: SbTopicSubscriptionEntityProvision): SbRuleEntityProvision[];
}

// tslint:disable-next-line: no-empty-interface
export interface SbManagementClientManagementAdapters { }
export type SbManagementClientOptions = SbManagementClientManagementAdapters[keyof SbManagementClientManagementAdapters];
