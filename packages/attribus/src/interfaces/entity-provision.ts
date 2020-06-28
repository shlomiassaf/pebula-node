import { SbQueue, SbTopic, SbSubscription, SbRule } from '../models';

export type SgEntityProvisionType = 'verify' | 'verifyCreate' | 'skip';

export interface SbEntityProvision<T> {
  /**
   * The provisioning type
   *
   * - skip: no provisioning
   * - verify: verify that the entity exists
   * - verifyCreate: verify that the entity exists and create it if not
   */
  type: SgEntityProvisionType;
  /**
   * The entity to create/update (e.g. SBQuery, SBTopic, etc...)
   */
  params?: T;
}

export interface SbQueueEntityProvision extends SbEntityProvision<SbQueue> {
  /**
   * Define how the forward queue/topic is provisioned ("forwardTo")
   * > Relevant only when "forwardTo" has a value.
   * @defaultValue skip (the actual default value is undefined, since it's unclear if the entity is a queue or a topic we must skip)
   */
  forward?: SbLinkedEntityProvisionOption;

  /**
   * Define how the dead letter queue/topic is provisioned ("forwardDeadLetteredMessagesTo")
   * > Relevant only when "forwardDeadLetteredMessagesTo" has a value.
   * @defaultValue skip (the actual default value is undefined, since it's unclear if the entity is a queue or a topic we must skip)
   */
  deadLetter?: SbLinkedEntityProvisionOption;
}

export interface SbTopicEntityProvision extends SbEntityProvision<SbTopic> {
}

export interface SbRuleEntityProvision extends SbEntityProvision<SbRule> {
  ruleName: string;
  params: SbRule;
}

export interface SbTopicSubscriptionEntityProvision extends SbEntityProvision<SbSubscription> {
  /**
   * Define how the topic for this subscription is provisioned.
   * Unlike "deadLetter", the default behavior is "skip" as it is usually the role of the topic's owner to create it.
   *
   * @defaultValue to "skip"
   */
  topic?: SbEntityProvisionOption<SbTopicEntityProvision>;

  /**
   * Define how the forward queue/topic is provisioned ("forwardTo")
   * > Relevant only when "forwardTo" has a value.
   * @defaultValue skip (the actual default value is undefined, since it's unclear if the entity is a queue or a topic we must skip)
   */
  forward?: SbLinkedEntityProvisionOption;

  /**
   * Define how the dead letter topic is provisioned ("forwardDeadLetteredMessagesTo")
   * > Relevant only when "forwardDeadLetteredMessagesTo" has a value.
   * @defaultValue skip (the actual default value is undefined, since it's unclear if the entity is a queue or a topic we must skip)
   */
  deadLetter?: SbLinkedEntityProvisionOption;

  /**
   * A list of rules (actions/filters) to apply to the subscription or, a function that results a list of rules dynamically.
   */
  rules?: SbRuleEntityProvision[] | ((topicName: string, subscriptionName: string) => SbRuleEntityProvision[]);
}

export type SbEntityProvisionOption<T extends SbEntityProvision<any>> = SgEntityProvisionType | T;

export type SbLinkedEntityProvisionOption<T extends 'queue' | 'topic' = 'queue' | 'topic'> =
  T extends 'queue'
    ? { type: 'queue', provision: SbEntityProvisionOption<SbQueueEntityProvision> }
    : { type: 'topic', provision: SbEntityProvisionOption<SbTopicEntityProvision> };
