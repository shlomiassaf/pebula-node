import { delay, SendableMessageInfo, ServiceBusMessage } from '@azure/service-bus';

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

  /**
   * Compares all the properties set on the given sent message with those
   * on the received message
   */
  static checkMessageContents(sent: SendableMessageInfo,
                              received: ServiceBusMessage,
                              useSessions?: boolean,
                              usePartitions?: boolean): void {
    if (sent.userProperties) {
      if (!received.userProperties) {
        throw new Error("Received message doesn't have any user properties");
      }
      const expectedUserProperties = sent.userProperties;
      const receivedUserProperties = received.userProperties;
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
        expect(received[key]).toEqual(sent[key]);
      } catch (err) {
        throw new Error(`Unexpected ${key} in received msg`);
      }
    }
  }
}
