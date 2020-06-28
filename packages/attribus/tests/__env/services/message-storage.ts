import { v4 } from 'uuid';
import { Subject, Subscription } from 'rxjs';
import { SendableMessageInfo, Sender, ServiceBusMessage } from '@azure/service-bus';
import { SbContext } from '@pebula/attribus';
import { IncomingMessageRecord, TestMessage } from '../utils';

const UNIQUE_MSG_ID_FIELD = 'ATTRIBUS_UNIQUE_MSG_ID_FIELD_KEY';

const SYNC_ERRORS = new WeakMap<any, Error>();

interface Promiser<T = any> { resolve: (value: T) => void; reject: (error: any) => void; promise: Promise<T>; }
export function promiser<T = any>(): Promiser<T> {
  let resolve: (value: T) => void;
  let reject: (error: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const TIMEOUT_ERROR = new Error('Timeout');
const ABORT_ERROR = new Error('Aborted');

export class MessageStorage {

  private store: IncomingMessageRecord[] = [];
  private onAdded$ = new Subject<IncomingMessageRecord>();
  private subscriptions: Subscription[] = [];
  private running = new Map<Promise<IncomingMessageRecord>, () => void>();

  add(context: SbContext): void {
    const record = { metadata: context.metadataOptions, msg: context.getMessage() };
    this.store.push(record);
    this.onAdded$.next(record);
    if (SYNC_ERRORS.has(record)) {
      const error = SYNC_ERRORS.get(record);
      SYNC_ERRORS.delete(record);
      throw error;
    }
  }

  flush(): IncomingMessageRecord[] {
    return this.store.splice(0, this.store.length);
  }

  clear(): void {
    this.store = [];
  }

  reset() {
    this.clear();
  }

  abort(token: Promise<IncomingMessageRecord>) {
    const abortFn = this.running.get(token);
    if (abortFn) {
      this.running.delete(token);
      abortFn();
      return true;
    }
    return false;
  }

  async waitForMessage(matcher: (msg: IncomingMessageRecord) => boolean,
                       onReceive: (msg: ServiceBusMessage) => void = undefined,
                       timeoutMs = 10000): Promise<IncomingMessageRecord> {
    return this._waitForMessage(matcher, onReceive, timeoutMs).promise;
  }

  async sendMessageAndWait(sender: Sender,
                           beforeSend: (msg: SendableMessageInfo) => (SendableMessageInfo | void) = undefined,
                           onReceive: (msg: ServiceBusMessage) => void = undefined,
                           timeoutMs = 10000): Promise<IncomingMessageRecord> {

    let testMessage = TestMessage.getSample();
    if (typeof beforeSend === 'function') {
      testMessage = beforeSend(testMessage) || testMessage;
    }

    if (!testMessage.userProperties) {
      testMessage.userProperties = {};
    }
    const uniqueId = testMessage.userProperties[UNIQUE_MSG_ID_FIELD] || v4();
    testMessage.userProperties[UNIQUE_MSG_ID_FIELD] = uniqueId;

    const waitForMessage = this.waitForMessage(
      incomingMsg => incomingMsg.msg.userProperties && incomingMsg.msg.userProperties[UNIQUE_MSG_ID_FIELD] === uniqueId,
      onReceive,
      timeoutMs,
    );

    const p = promiser<IncomingMessageRecord>();

    this.running.set(p.promise, () => {
      this.abort(waitForMessage);
    });

    sender.send(testMessage)
      .catch(err => {
        p.reject(err);        
        this.abort(waitForMessage);
      });

    waitForMessage
      .then( result => p.resolve(result) )
      .catch( err => {
        if (err === ABORT_ERROR) {
          return;
        } else if (err === TIMEOUT_ERROR) {
          p.reject(new Error('Timeout'));
        } else {
          p.reject(err);
        }
      })
      .then( () => {
        this.running.delete(p.promise);
      });

    return p.promise;
  }

  async waitForCount(count: number, timeoutMs = 10000): Promise<IncomingMessageRecord[]> {
    if (this.store.length === count) {
      return Promise.resolve(this.store);
    } else if (this.store.length > count) {
      return Promise.reject(new Error(`More items then waiting for.`));
    } else {
      return new Promise<IncomingMessageRecord[]>( (resolve, reject) => {
        const clearSubscription = (s: Subscription) => {
          const index = this.subscriptions.indexOf(s);
          if (index !== -1) {
            this.subscriptions.splice(index, 1);
          }
          if (!s.closed) {
            s.unsubscribe();
          }
        }

        const cancelTimeoutToken = setTimeout(() => {
          clearSubscription(subscription);
          reject(new Error('Timeout'));
        }, timeoutMs);

        const subscription = this.onAdded$
          .subscribe(
            () => {
              if (this.store.length === count) {
                clearTimeout(cancelTimeoutToken);
                clearSubscription(subscription);
                setTimeout(() => resolve(this.store), 10);
              }
            },
            err => {
              clearTimeout(cancelTimeoutToken);
              clearSubscription(subscription);
              reject(err);
            }
          );
          this.subscriptions.push(subscription);
      });
      
    }
  }

  private _waitForMessage(matcher: (msg: IncomingMessageRecord) => boolean,
                          onReceive: (msg: ServiceBusMessage) => void = undefined,
                          timeoutMs = 10000): Promiser<IncomingMessageRecord> {

    const p = promiser<IncomingMessageRecord>();

    const clearSubscription = (s: Subscription) => {
      this.running.delete(p.promise)
      const index = this.subscriptions.indexOf(s);
      if (index !== -1) {
        this.subscriptions.splice(index, 1);
      }
      if (!s.closed) {
        s.unsubscribe();
      }
    }

    const cancelTimeoutToken = setTimeout(() => {
      clearSubscription(subscription);
      p.reject(TIMEOUT_ERROR);
    }, timeoutMs);

    const abort = () => {
      clearTimeout(cancelTimeoutToken);
      clearSubscription(subscription);
      p.reject(ABORT_ERROR);
    };

    const subscription = this.onAdded$
      .subscribe(
        incomingMsg => {
          if (matcher(incomingMsg)) {
            clearTimeout(cancelTimeoutToken);
            clearSubscription(subscription);
            setTimeout(() => {
              SYNC_ERRORS.delete(incomingMsg);
              p.resolve(incomingMsg)
            }, 10);

            if (typeof onReceive === 'function') {
              try {
                onReceive(incomingMsg.msg);
              } catch (err) {
                SYNC_ERRORS.set(incomingMsg, err);
              }
            }
          }
        },
        err => {
          clearTimeout(cancelTimeoutToken);
          clearSubscription(subscription);
          p.reject(err);
        }
      );

    this.subscriptions.push(subscription);
    this.running.set(p.promise, abort)

    return p;
  }
}
