import { delay, SendableMessageInfo, ServiceBusMessage } from '@azure/service-bus';
import { ClientEntityContextBase } from '@azure/service-bus/src/clientEntityContext';
import { SbSubscriptionMetadataOptions, SbQueueSubscriptionMetadataOptions, SbContext } from '@pebula/attribus';

const TO_THROW_ERROR_KEY = 'ATTRIBUS_MESSAGE_STORAGE_TO_THROW_ERROR_KEY';

export interface IncomingMessageRecord {
  metadata: SbSubscriptionMetadataOptions | SbQueueSubscriptionMetadataOptions;
  msg: ServiceBusMessage;
}

/**
 * Maximum wait duration for the expected event to happen = `10000 ms`(default value is 10 seconds)(= maxWaitTimeInMilliseconds)
 * Keep checking whether the predicate is true after every `1000 ms`(default value is 1 second) (= delayBetweenRetriesInMilliseconds)
 */
export async function checkWithTimeout(predicate: () => boolean,
                                       delayBetweenRetriesInMilliseconds: number = 1000,
                                        maxWaitTimeInMilliseconds: number = 10000): Promise<boolean> {
  const maxTime = Date.now() + maxWaitTimeInMilliseconds;
  while (Date.now() < maxTime) {
    if (predicate()) {
      return true;
    }
    await delay(delayBetweenRetriesInMilliseconds);
  }
  return false;
}


export class TestMessage {
  static sessionId: string = "my-session";

  static getSample(msg: Partial<SendableMessageInfo> = {}): SendableMessageInfo {
    const randomNumber = Math.random();
    return {
      body: `message body ${randomNumber}`,
      messageId: `message id ${randomNumber}`,
      contentType: `content type ${randomNumber}`,
      correlationId: `correlation id ${randomNumber}`,
      timeToLive: 60 * 60 * 24,
      label: `label ${randomNumber}`,
      userProperties: {
        propOne: 1,
        propTwo: "two",
        propThree: true
      },
      ...msg,
    };
  }

  static getSessionSample(msg: Partial<SendableMessageInfo> = {}): SendableMessageInfo {
    return {
      ...TestMessage.getSample(msg),
      sessionId: TestMessage.sessionId,
    };
  }

  static markForThrow(msg: SendableMessageInfo, error: string) {
    if (!msg.userProperties) {
      msg.userProperties = {};
    }
    msg.userProperties[TO_THROW_ERROR_KEY] = error;
  }

  /**
   * Compares all the properties set on the given sent message with those
   * on the received message
   */
  static checkMessageContents(sent: SendableMessageInfo,
                              received: IncomingMessageRecord,
                              useSessions?: boolean,
                              usePartitions?: boolean): void {
    const { msg, metadata } = received;
    const clientEntityContext: ClientEntityContextBase = msg['_context'];

    if ('topicName' in metadata) {
      expect(clientEntityContext.clientType).toBe('SubscriptionClient');
      expect(`${metadata.topicName}/Subscriptions/${metadata.name}`).toBe(clientEntityContext.entityPath);
    } else {
      expect(clientEntityContext.clientType).toBe('QueueClient');
      expect(metadata.name).toBe(clientEntityContext.entityPath);
    }
  
    if (sent.userProperties) {
      if (!msg.userProperties) {
        throw new Error("Received message doesn't have any user properties");
      }
      const expectedUserProperties = sent.userProperties;
      const receivedUserProperties = msg.userProperties;
      for (const [key, value] of Object.entries(expectedUserProperties)) {
        try {
          expect(receivedUserProperties[key]).toEqual(value);
        } catch (err) {
          throw new Error(`Unexpected value for user property for ${key}`);
        }
      }
    }

    const keys: (keyof SendableMessageInfo & keyof ServiceBusMessage)[] = [
      'body',
      'messageId',
      'contentType',
      'correlationId',
    ];
    for (const key of keys) {
      try {
        expect(msg[key]).toEqual(sent[key]);
      } catch (err) {
        throw new Error(`Unexpected ${key} in received msg`);
      }
    }
  }
}
