import { ReceiveMode, SessionReceiverOptions, MessageHandlerOptions } from '@azure/service-bus';
import { SbEntityProvisionOption, SbQueueEntityProvision, SbTopicSubscriptionEntityProvision } from './entity-provision';

export interface SbSubscriberMetadataOptions {
  name: string;
  receiveMode: ReceiveMode;
  handlerOptions?: MessageHandlerOptions;
  sessionOptions?: SessionReceiverOptions;

  /**
   * When true, will not forward/propagate errors thrown from within the handler to service bus. It will swallow the error
   * letting `@azure/service-bus` think there are no errors.
   *
   * > This is an advanced setting which requires complete understanding of how `@azure/service-bus` handle the handlers.
   * 
   * ## Background
   * 
   * Service bus invokes all handlers within a try/catch block and each error is handled based on the following (simple) logic:
   * 
   * 1. Invoke the handler
   *
   * 2. If error:
   *    A. Let the user error handler know about it (sync call to `onError` in `registerMessageHandler`) [Step skipped if it's an AMQP error]
   *    B. If `receiveMode` is `peekLock` and the message had not settled - Automatically abandon the message
   *       This step is here to prevent waiting for the lock on the message to end, retuning it to the queue immediately.
   *       Nice, but can not be configured, will be done on every error in `peekLock`
   *       Note that this process is async but not manageable, you never know when it ended, only if it errors the `onError` will invoke.
   *    C. Stop the handling process
   *
   * 3. If no error:
   *    A. If `receiveMode` is `peekLock` and `autoComplete` is on (default), complete the message
   *       This one is configurable, by setting `autoComplete` to false it will not fire.
   *       However, when it does, same as above, no control over the process it fires and you can't tell when it ends.
   *       If it throws, `onError` is invoked.
   *
   * ## Problem
   * 
   * How can we avoid the automatic abandoning of the message in `peekLock` mode?
   * What if we want to complete the message and not abandon it? how can we get notified when abandon process has completed?
   * 
   * ## Solution
   * 
   * Catch the error before it propagates and hide it as nothing happened.
   * Because we can't just hide errors, we will still notify the `onError` with the error (Allowing handling of it on the SbErrorHandler registered).
   * 
   * - The error notification will now fire async, using the `SbErrorHandler.onMessageError`, allowing fine tune control over the process.
   * - If you re-throw from the error handler you will revert back (just this one time) to the old behavior, using the original logic
   *
   * > NOTE that throwing from the error handler will result in the same error pushed back to the error handler by the service bus logic
   * 
   * ## Risks
   * 
   * Because we are hiding the error, service bus will think the message was processed correctly and will initiate a complete to the message
   * if we're in `peekLock` mode and `autoComplete` is enabled.
   * This is SUPER RISKY because it effects logic.
   * 
   * This is why it is not possible to swallow errors when `autoComplete` is enabled in `peekLock` mode just by setting `swallowErrors` to `true`.
   * If you set `swallowErrors` to `true` while `autoComplete` is enabled in `peekLock` mode the process will throw!
   *
   * To enable `swallowErrors` while `autoComplete` is enabled in `peekLock` mode you need to specifically set the value `swallowAndAutoComplete` to 
   * `swallowErrors`
   * 
   * When using this solution to 
   *
   * @default false
   */
  swallowErrors?: boolean | 'swallowAndAutoComplete';

  /**
   * The unique id of the server that this emitter should use as the underlying listener.
   * This should match the server name defined in `SgServerOptions.name`.
   *
   * By default `SgServerOptions.name` is not set, which is the identifier for the default server.
   * A multi-server environment is not required in most of the scenarios, if that is the case do not set this value.
   */
  serverId?: string;
}

export interface SbQueueSubscriptionMetadataOptions extends SbSubscriberMetadataOptions {
  provision?: SbEntityProvisionOption<SbQueueEntityProvision>;
}

export interface SbSubscriptionMetadataOptions extends SbSubscriberMetadataOptions {
  topicName: string;
  provision?: SbEntityProvisionOption<SbTopicSubscriptionEntityProvision>;
  // filter etc...
}

export interface SbSubscriberTypeMap {
  queue: SbQueueSubscriptionMetadataOptions;
  subscription: SbSubscriptionMetadataOptions;
}
