import { Injectable } from '@nestjs/common';
import {
  ServiceBusModule,
  SbServerOptions,
  SbManagementDefaultsAdapter,
  SbRuleEntityProvision,
  SbTopicSubscriptionEntityProvision,
  SbRule,
} from '@pebula/nesbus';

export type SbConnection = { type: 'connectionString'; sasConnectionString: string; } | {
  type: 'activeDirectory';
  host: string;
  resourceGroupName: string;
  namespace: string;
  subscriptionId: string;
  credentials: {
    tenantId: string;
    clientId: string;
    clientSecret: string;
  };
  verifyEntityExistence: boolean;
 }

@Injectable()
export class ConfigService {
  sbConnection(): { client: SbConnection; management: SbConnection; } {
    const sasConnectionString = process.env.SERVICEBUS_CONNECTION_STRING;
    return {
      client: {
        type: 'connectionString',
        sasConnectionString,
      },
      management: {
        type: 'connectionString',
        sasConnectionString,
      }
    };
  }

  sbDefaultsAdapter(): SbManagementDefaultsAdapter {
    function createReceiversRule(subscriptionName: string): SbRule {
      // tslint:disable-next-line: max-line-length
      const sqlExpression = `(NOT EXISTS(Recievers) OR Recievers = '[${subscriptionName}]' OR Recievers LIKE '[${subscriptionName},%' OR Recievers LIKE '%,${subscriptionName},%' OR Recievers LIKE '%,${subscriptionName}]')`;
      return { filter: { sqlExpression } };
    }
    const defaults: SbManagementDefaultsAdapter = {
      entities: {
        queue: {
          deadLetteringOnMessageExpiration: true,
          maxSizeInMegabytes: 1024,
          defaultMessageTimeToLive : 'P14D',
          lockDuration: 'PT5M',
        },
        topic: {
          defaultMessageTimeToLive : 'P14D',
          maxSizeInMegabytes: 1024,
        },
        subscription: {
          deadLetteringOnMessageExpiration: true,
          defaultMessageTimeToLive : 'P14D',
          lockDuration: 'PT5M',
        },
      },
      onNewSubscriptionRules(topicName: string,
                             subscriptionName: string,
                             providedRules: SbRuleEntityProvision[],
                             subscriptionProvision: SbTopicSubscriptionEntityProvision): SbRuleEntityProvision[] {
        return [
          ...providedRules,
          {
            type: subscriptionProvision.type,
            ruleName: `${subscriptionName}_Filter`,
            params: createReceiversRule(subscriptionName),
          },
        ];
      },
    };
  
    return defaults;
  }

}