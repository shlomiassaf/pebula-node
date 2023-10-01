// TODO: ON_ATOM_IS_PUBLIC
import { QueueProperties } from '../atom-adapter/atom-client/src/serializers/queueResourceSerializer';
import { TopicProperties } from '../atom-adapter/atom-client/src/serializers/topicResourceSerializer';
import { SubscriptionProperties } from '../atom-adapter/atom-client/src/serializers/subscriptionResourceSerializer';
import { RuleProperties } from '../atom-adapter/atom-client/src/serializers/ruleResourceSerializer';
import { SqlRuleFilter } from '../atom-adapter/atom-client/src/serializers/ruleResourceSerializer';
import { CorrelationRuleFilter } from '../atom-adapter/atom-client/src/core/managementClient';

export type SbQueue = Partial<Omit<QueueProperties, 'name'>>;
export type SbTopic = Partial<Omit<TopicProperties, 'name'>>;
export type SbSubscription = Partial<Omit<SubscriptionProperties, 'subscriptionName' | 'topicName'>>;
export type SbRule = Partial<Omit<RuleProperties, 'createdAt'>>;
export type SbSqlFilter = Omit<SqlRuleFilter, 'sqlParameters'>;
export type SbCorrelationFilter = Partial<CorrelationRuleFilter>;
