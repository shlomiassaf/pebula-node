import { from, of } from 'rxjs';
import { mapTo, catchError, tap } from 'rxjs/operators';
import { ServiceBusMessage, ReceiveMode } from '@azure/service-bus';
import { SbInterceptor, SbContext, NextInterceptor } from '@pebula/attribus';

import { abandonMessage, completeMessage, deadLetter, block } from '../rx-operators';
import { SbBackoffRetryOptions, DEFAULT_BACKOFF_CONFIG, extractRetryCount, calculateBackOffTime } from './utils';

export class SbBackoffRetry implements SbInterceptor {

  static findRetryCount(msg: ServiceBusMessage, retryCountKey?: string): number | false {
    return extractRetryCount(retryCountKey || DEFAULT_BACKOFF_CONFIG.retryCountKey, msg);
  }

  private config: SbBackoffRetryOptions;

  constructor(options?: SbBackoffRetryOptions) {
    this.config = { ...DEFAULT_BACKOFF_CONFIG, ...(options || {}) };
  }

  intercept(context: SbContext, next: NextInterceptor) {
    const { retryCount, retryCountKey } = this.config;
    const msg = context.getMessage();
    const currentRetryCount = extractRetryCount(retryCountKey, msg) || 0;

    if (currentRetryCount > retryCount) {
      const deadletterReason = `Message exceeded back-off retry [ MAX: ${retryCount}, ACTUAL: ${currentRetryCount} ]`;
      context.logger.log(deadletterReason);

      let op: ReturnType<typeof abandonMessage>;
      if (context.metadataOptions.receiveMode === ReceiveMode.peekLock) {
        switch (this.config.onBackoffMaxRetry) {
          case 'deadLetter':
            op = deadLetter({
              deadletterReason,
              deadLetterErrorDescription: (msg.userProperties && msg.userProperties[this.config.retryCountKey + 'LAST_ERROR']) || '',
            });
            break;
          case 'complete':
            op = completeMessage();
            break;
          default:
            op = abandonMessage();
            break;
        }
      } else {
        op = tap(() => {});
      }
      return of(context).pipe(op, block());
    } else {
      return next.handle()
        .pipe(
          catchError( (error, caught) => {
            const backOffDelay = calculateBackOffTime(this.config, currentRetryCount);
            const scheduledEnqueueTimeUtc = new Date(Date.now() + backOffDelay);

            if (!msg.userProperties) {
              msg.userProperties = {};
            }
            msg.userProperties[this.config.retryCountKey] = currentRetryCount + 1;
            msg.userProperties[this.config.retryCountKey + 'LAST_ERROR'] = error.toString();
            
            context.logger.log(`Message back-off iteration ${currentRetryCount}, calculated back-off delay: ${backOffDelay}, scheduled to: ${scheduledEnqueueTimeUtc.toUTCString()}`);

            const op = context.metadataOptions.receiveMode === ReceiveMode.peekLock
              ? completeMessage()
              : tap(() => {})
            ;

            return from(context.resolveClient().scheduleMessage(scheduledEnqueueTimeUtc, msg))
              .pipe(
                mapTo(context),
                op,
                block(),
              );
          }),
        );
    }
  }
}
