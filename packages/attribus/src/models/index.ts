// TODO: ON_ATOM_IS_PUBLIC
import { QueueDetails } from '../atom-adapter/atom-client/src/serializers/queueResourceSerializer';
import { TopicDetails } from '../atom-adapter/atom-client/src/serializers/topicResourceSerializer';
import { SubscriptionDetails } from '../atom-adapter/atom-client/src/serializers/subscriptionResourceSerializer';
import { RuleDetails } from '../atom-adapter/atom-client/src/serializers/ruleResourceSerializer';
import { SqlFilter } from '../atom-adapter/atom-client/src/serializers/ruleResourceSerializer';
import { CorrelationFilter } from '../atom-adapter/atom-client/src/core/managementClient';

export type SbQueue = Partial<Omit<QueueDetails, 'queueName'>>;
export type SbTopic = Partial<Omit<TopicDetails, 'topicName'>>;
export type SbSubscription = Partial<Omit<SubscriptionDetails, 'subscriptionName' | 'topicName'>>;
export type SbRule = Partial<Omit<RuleDetails, 'createdOn'>>;
export type SbSqlFilter = Partial<Omit<SqlFilter, 'sqlParameters'>>;
export type SbCorrelationFilter = Partial<CorrelationFilter>;
