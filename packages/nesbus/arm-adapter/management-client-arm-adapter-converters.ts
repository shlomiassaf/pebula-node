import * as armModels from '@azure/arm-servicebus/esm/models';
import { SbQueue, SbTopic, SbSubscription, SbRule, SbCorrelationFilter, SbSqlFilter } from '../src/models';

export function convertToQueue(queue: armModels.SBQueue): SbQueue {
  const {
    countDetails,
    createdAt,
    updatedAt,
    accessedAt,
    sizeInBytes,
    messageCount,
    lockDuration,
    maxSizeInMegabytes,
    requiresDuplicateDetection,
    requiresSession,
    defaultMessageTimeToLive,
    deadLetteringOnMessageExpiration,
    duplicateDetectionHistoryTimeWindow,
    maxDeliveryCount,
    status,
    enableBatchedOperations,
    autoDeleteOnIdle,
    enablePartitioning,
    enableExpress,
    forwardTo,
    forwardDeadLetteredMessagesTo,
  } = queue;
  return {
    lockDuration,
    sizeInBytes,
    maxSizeInMegabytes,
    messageCount,
    defaultMessageTtl: defaultMessageTimeToLive,
    duplicateDetectionHistoryTimeWindow,
    forwardDeadLetteredMessagesTo,
    autoDeleteOnIdle,
    maxDeliveryCount,
    requiresSession,
    enableBatchedOperations,
    requiresDuplicateDetection,
    deadLetteringOnMessageExpiration,
    forwardTo,
    // userMetadata,
    enablePartitioning,
    // authorizationRules,
    messageCountDetails: {
      activeMessageCount: countDetails.activeMessageCount,
      deadLetterMessageCount: countDetails.deadLetterMessageCount,
      scheduledMessageCount: countDetails.scheduledMessageCount,
      transferMessageCount: countDetails.transferMessageCount,
      transferDeadLetterMessageCount: countDetails.transferDeadLetterMessageCount,
    },
    // supportOrdering,
    enableExpress,
    // isAnonymousAccessible,
    // entityAvailabilityStatus,
    status,
    createdOn: createdAt.toISOString(),
    updatedOn: updatedAt.toISOString(),
    accessedOn: accessedAt.toISOString(),
  };
}

export function convertToTopic(topic: armModels.SBTopic): SbTopic {
  const {
    sizeInBytes,
    createdAt,
    updatedAt,
    accessedAt,
    subscriptionCount,
    countDetails,
    defaultMessageTimeToLive,
    maxSizeInMegabytes,
    requiresDuplicateDetection,
    duplicateDetectionHistoryTimeWindow,
    enableBatchedOperations,
    status,
    supportOrdering,
    autoDeleteOnIdle,
    enablePartitioning,
    enableExpress,
  } = topic;
  return {
    sizeInBytes,
    maxSizeInMegabytes,
    requiresDuplicateDetection,
    // enableSubscriptionPartitioning,
    // filteringMessagesBeforePublishing,
    // authorizationRules?: AuthorizationRule[];
    enablePartitioning,
    supportOrdering,
    enableBatchedOperations,
    autoDeleteOnIdle,
    // messageCount,
    subscriptionCount,
    // maxDeliveryCount,
    defaultMessageTtl: defaultMessageTimeToLive,
    duplicateDetectionHistoryTimeWindow,
    // userMetadata,
    // isExpress?: boolean;
    enableExpress,
    messageCountDetails: {
      activeMessageCount: countDetails.activeMessageCount,
      deadLetterMessageCount: countDetails.deadLetterMessageCount,
      scheduledMessageCount: countDetails.scheduledMessageCount,
      transferMessageCount: countDetails.transferMessageCount,
      transferDeadLetterMessageCount: countDetails.transferDeadLetterMessageCount,
    },
    // isAnonymousAccessible?: boolean;
    entityAvailabilityStatus: undefined,
    status,
    createdOn: createdAt.toISOString(),
    updatedOn: updatedAt.toISOString(),
    accessedOn: accessedAt.toISOString(),
  };
}

export function convertToSubscription(subscription: armModels.SBSubscription): SbSubscription {
  const {
    messageCount,
    createdAt,
    accessedAt,
    updatedAt,
    countDetails,
    lockDuration,
    requiresSession,
    defaultMessageTimeToLive,
    deadLetteringOnFilterEvaluationExceptions,
    deadLetteringOnMessageExpiration,
    duplicateDetectionHistoryTimeWindow,
    maxDeliveryCount,
    status,
    enableBatchedOperations,
    autoDeleteOnIdle,
    forwardTo,
    forwardDeadLetteredMessagesTo,
  } = subscription;
  return {
    lockDuration,
    // sizeInBytes,
    // maxSizeInMegabytes,
    messageCount,
    // enablePartitioning,
    requiresSession,
    enableBatchedOperations,
    defaultMessageTtl: defaultMessageTimeToLive,
    // defaultRuleDescription,
    autoDeleteOnIdle,
    deadLetteringOnMessageExpiration,
    deadLetteringOnFilterEvaluationExceptions,
    forwardDeadLetteredMessagesTo,
    maxDeliveryCount,
    forwardTo,
    // userMetadata,
    messageCountDetails: {
      activeMessageCount: countDetails.activeMessageCount,
      deadLetterMessageCount: countDetails.deadLetterMessageCount,
      scheduledMessageCount: countDetails.scheduledMessageCount,
      transferMessageCount: countDetails.transferMessageCount,
      transferDeadLetterMessageCount: countDetails.transferDeadLetterMessageCount,
    },
    entityAvailabilityStatus: undefined,
    status,
    createdOn: createdAt.toISOString(),
    updatedOn: updatedAt.toISOString(),
    accessedOn: accessedAt.toISOString(),
  };
}

export function convertFromRule(rule: SbRule): armModels.Rule {
  const filterType = findFilterType(rule);
  const armRule: armModels.Rule = { filterType };
  if (filterType === 'SqlFilter') {
    armRule.sqlFilter = convertSqlFilter('from', rule.filter as SbSqlFilter);
    if (rule.action) {
      armRule.action = convertSqlFilter('from', rule.action as SbSqlFilter);
    }
  } else {
    armRule.correlationFilter = convertCorrelationFilter('from', rule.filter as SbCorrelationFilter);
  }
  return armRule;
}

export function convertToRule(topicName: string, subscriptionName: string, ruleName: string, rule: armModels.Rule): SbRule {
  return {
    ruleName,
    filter: rule.filterType === 'SqlFilter' ? convertSqlFilter('to', rule.sqlFilter) : convertCorrelationFilter('to', rule.correlationFilter),
    action: rule.action ? convertSqlFilter('to', rule.action) : undefined,
    topicName,
    subscriptionName,
  };
}

function convertSqlFilter(dir: 'to', filter: armModels.SqlFilter): SbSqlFilter;
function convertSqlFilter(dir: 'from', filter: SbSqlFilter): armModels.SqlFilter;
function convertSqlFilter(dir: 'to' | 'from',
                          filter: armModels.SqlFilter | SbSqlFilter): SbSqlFilter | armModels.SqlFilter {
  const { sqlExpression, compatibilityLevel, requiresPreprocessing } = filter; // no place for sqlParameters
  return { sqlExpression, compatibilityLevel, requiresPreprocessing };
}

function convertCorrelationFilter(dir: 'to', filter: armModels.CorrelationFilter): SbCorrelationFilter;
function convertCorrelationFilter(dir: 'from', filter: SbCorrelationFilter): armModels.CorrelationFilter;
function convertCorrelationFilter(dir: 'to' | 'from',
                                  filter: armModels.CorrelationFilter | SbCorrelationFilter): SbCorrelationFilter | armModels.CorrelationFilter {
  const {
    correlationId,
    messageId,
    to,
    replyTo,
    label,
    sessionId,
    replyToSessionId,
    contentType,
  } = filter;
  const result: SbCorrelationFilter | armModels.CorrelationFilter = {
    correlationId,
    messageId,
    to,
    replyTo,
    label,
    sessionId,
    replyToSessionId,
    contentType,
  };
  if (dir === 'to') {
    (result as SbCorrelationFilter).userProperties = (result as armModels.CorrelationFilter).properties;
  } else {
    (result as armModels.CorrelationFilter).properties = (result as SbCorrelationFilter).userProperties;
  }
  return result;
}

const SQL_FILTER_KEYS = [
  'sqlExpression',
  'compatibilityLevel',
  'requiresPreprocessing',
  'sqlParameters',
];

function findFilterType(rule: SbRule): armModels.FilterType {
  return SQL_FILTER_KEYS.some( k => k in rule.filter ) ? 'SqlFilter' : 'CorrelationFilter';
}
