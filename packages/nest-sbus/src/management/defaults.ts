import { isFunction } from 'util';
import { SbManagementDefaultsAdapter, SbRuleEntityProvision, SbTopicSubscriptionEntityProvision } from '../interfaces';

const DEFAULT_ENTITIES: SbManagementDefaultsAdapter['entities'] = {
  queue: {},
  topic: {},
  subscription: {},
};

export function normalizeDefaults(defaults?: SbManagementDefaultsAdapter): SbManagementDefaultsAdapter {
  const result = { ...(defaults || {}) };

  result.entities = { ...DEFAULT_ENTITIES, ...(result.entities || {}) };

  return result;
}

export function resolveRules(topicName: string,
                             subscriptionName: string,
                             provision: SbTopicSubscriptionEntityProvision,
                             defaults: SbManagementDefaultsAdapter): SbRuleEntityProvision[] {

  const rules = typeof provision.rules === 'function' ? provision.rules(topicName, subscriptionName) : provision.rules;
  const forSureRules = Array.isArray(rules) ? rules : [];

  if (isFunction(defaults.onNewSubscriptionRules)) {
    return defaults.onNewSubscriptionRules(
      topicName,
      subscriptionName,
      forSureRules,
      provision,
    );
  } else {
    return forSureRules;
  }
}
