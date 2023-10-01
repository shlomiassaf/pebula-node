import { ServiceBusReceiver, ServiceBusSessionReceiver, ProcessErrorArgs, ServiceBusReceivedMessage, SubscribeOptions } from '@azure/service-bus';

/**
 * The async version for `Receiver.registerMessageHandler` with feedback on the connection status.
 *
 * Remove then https://github.com/Azure/azure-sdk-for-js/issues/7986 is resolved
 */
export async function registerMessageHandler(receiver: ServiceBusReceiver | ServiceBusSessionReceiver, 
                                             onMessage: (message: ServiceBusReceivedMessage) => Promise<void>, 
                                             onError: (error :ProcessErrorArgs) => Promise<void>, 
                                             options?: SubscribeOptions) {
  return new Promise<void>( (resolve, reject) => {
    let done = false;
    const onErrorRouter = async (err : ProcessErrorArgs) => {
      if (done) {
        await onError(err);
      }
      else {
        done = true;
        reject(err);
      }
    };

    const poll = () => {
      setTimeout(() => {
        // isReceivingMessages() changed to private method in V7, no alternative provided 
        if ((receiver as any)._isReceivingMessages()) {
          done = true;
          resolve();
        } else if (!done) {
          poll();
        }
      }, 10); 
    };
    
    receiver.subscribe({ processMessage: onMessage, processError: onErrorRouter}, options);
    poll();
  });
}
