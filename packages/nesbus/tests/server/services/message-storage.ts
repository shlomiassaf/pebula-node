import { Subject, Subscription } from 'rxjs';
import { ServiceBusMessage } from '@azure/service-bus';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageStorage {

  private store: ServiceBusMessage[] = [];
  private onAdded$ = new Subject<ServiceBusMessage>();
  private subscriptions: Subscription[] = [];

  add(msg: ServiceBusMessage): void {
    this.store.push(msg);
    this.onAdded$.next(msg);
  }

  flush(): ServiceBusMessage[] {
    return this.store.splice(0, this.store.length);
  }

  clear(): void {
    this.store = [];
  }

  reset() {
    this.clear();

  }
  async waitForCount(count: number, timeoutMs = 10000): Promise<ServiceBusMessage[]> {
    if (this.store.length === count) {
      return Promise.resolve(this.store);
    } else if (this.store.length > count) {
      return Promise.reject(new Error(`More items then waiting for.`));
    } else {
      return new Promise<ServiceBusMessage[]>( (resolve, reject) => {
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
}
