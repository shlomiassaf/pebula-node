import * as armModels from '@azure/arm-servicebus';
import { SbQueue, SbTopic, SbSubscription, SbRule, SbCorrelationFilter, SbSqlFilter } from '../src/models';

export function convertToQueue(queue: armModels.SBQueue): SbQueue {
  const {
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
    maxMessageSizeInKilobytes,
  } = queue;
  return {
    lockDuration,
    maxSizeInMegabytes,
    defaultMessageTimeToLive,
    duplicateDetectionHistoryTimeWindow,
    forwardDeadLetteredMessagesTo,
    autoDeleteOnIdle,
    maxDeliveryCount,
    requiresSession,
    enableBatchedOperations,
    requiresDuplicateDetection,
    deadLetteringOnMessageExpiration,
    forwardTo,
    enablePartitioning,
    enableExpress,
    status,
    maxMessageSizeInKilobytes,
  };
}

export function convertToTopic(topic: armModels.SBTopic): SbTopic {
  const {
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
    maxMessageSizeInKilobytes
  } = topic;
  return {
    maxSizeInMegabytes,
    requiresDuplicateDetection,
    enablePartitioning,
    supportOrdering,
    enableBatchedOperations,
    autoDeleteOnIdle,
    defaultMessageTimeToLive,
    duplicateDetectionHistoryTimeWindow,
    enableExpress,
    status,
    maxMessageSizeInKilobytes,
  };
}

export function convertToSubscription(subscription: armModels.SBSubscription): SbSubscription {
  const {
    lockDuration,
    requiresSession,
    defaultMessageTimeToLive,
    deadLetteringOnFilterEvaluationExceptions,
    deadLetteringOnMessageExpiration,
    maxDeliveryCount,
    status,
    enableBatchedOperations,
    autoDeleteOnIdle,
    forwardTo,
    forwardDeadLetteredMessagesTo,
  } = subscription;
  return {
    lockDuration,
    requiresSession,
    enableBatchedOperations,
    defaultMessageTimeToLive,
    autoDeleteOnIdle,
    deadLetteringOnMessageExpiration,
    deadLetteringOnFilterEvaluationExceptions,
    forwardDeadLetteredMessagesTo,
    maxDeliveryCount,
    forwardTo,
    status,
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

export function convertToRule(ruleName: string, rule: armModels.Rule): SbRule {
  return {
    name: ruleName,
    filter: rule.filterType === 'SqlFilter' ? convertSqlFilter('to', rule.sqlFilter) : convertCorrelationFilter('to', rule.correlationFilter),
    action: rule.action ? convertSqlFilter('to', rule.action) : undefined,
  };
}

function convertSqlFilter(dir: 'to', filter: armModels.SqlFilter): SbSqlFilter;
function convertSqlFilter(dir: 'from', filter: SbSqlFilter): armModels.SqlFilter;
function convertSqlFilter(dir: 'to' | 'from',
                          filter: armModels.SqlFilter | SbSqlFilter): SbSqlFilter | armModels.SqlFilter {
  const { sqlExpression } = filter;
  return { sqlExpression };
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
    sessionId,
    replyToSessionId,
    contentType,
  } = filter;
  const result: SbCorrelationFilter | armModels.CorrelationFilter = {
    correlationId,
    messageId,
    to,
    replyTo,
    sessionId,
    replyToSessionId,
    contentType,
  };
  if (dir === 'to') {
    (result as SbCorrelationFilter).applicationProperties = (filter as armModels.CorrelationFilter).properties;
    (result as SbCorrelationFilter).subject = (filter as armModels.CorrelationFilter).label;
  } else {
    (result as armModels.CorrelationFilter).properties = (filter as SbCorrelationFilter).applicationProperties as { [propertyName: string]: string };
    (result as armModels.CorrelationFilter).label = (filter as SbCorrelationFilter).subject;
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
