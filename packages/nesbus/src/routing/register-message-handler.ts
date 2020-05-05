import { OnMessage, OnError, MessageHandlerOptions, MessagingError, Receiver, SessionReceiver } from '@azure/service-bus';

/**
 * The async version for `Receiver.registerMessageHandler` with feedback on the connection status.
 *
 * Remove then https://github.com/Azure/azure-sdk-for-js/issues/7986 is resolved
 */
export async function registerMessageHandler(receiver: Receiver | SessionReceiver, onMessage: OnMessage, onError: OnError, options?: MessageHandlerOptions) {
  return new Promise( (resolve, reject) => {
    let done = false;
    const onErrorRouter: OnError = err => {
      if (done || err instanceof MessagingError) {
        onError(err);
      }
      else {
        done = true;
        reject(err);
      }
    };

    const poll = () => {
      setTimeout(() => {
        if (receiver.isReceivingMessages()) {
          done = true;
          resolve();
        } else if (!done) {
          poll();
        }
      }, 10); 
    };

    receiver.registerMessageHandler(onMessage, onErrorRouter);
    poll();
  });
}
