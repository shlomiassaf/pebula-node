import { from, of } from 'rxjs';
import { mapTo, catchError } from 'rxjs/operators';
import { ServiceBusReceivedMessage } from '@azure/service-bus';
import { Logger, Injectable, CallHandler, Inject, Optional } from '@nestjs/common';
import { SbInterceptor, SbContext } from '@pebula/nesbus';

import { abandonMessage, completeMessage, block } from '../rx-operators';
import { SB_BACKOFF_RETRY_DEFAULTS } from './constants';
import { SbBackoffRetryOptions, DEFAULT_BACKOFF_CONFIG, extractRetryCount, createBackoffClone } from './utils';

@Injectable()
export class SbBackoffRetry implements SbInterceptor {

  static findRetryCount(msg: ServiceBusReceivedMessage, retryCountKey?: string): number | false {
    return extractRetryCount(retryCountKey || DEFAULT_BACKOFF_CONFIG.retryCountKey, msg);
  }

  private config: SbBackoffRetryOptions;
  private logger = new Logger('RetryWithBackOff');

  constructor(@Inject(SB_BACKOFF_RETRY_DEFAULTS) @Optional() options?: SbBackoffRetryOptions) {
    this.config = { ...DEFAULT_BACKOFF_CONFIG, ...(options || {}) };
  }

  intercept(context: SbContext, next: CallHandler) {
    const { retryCount, retryCountKey } = this.config;
    const msg = context.getMessage();
    const currentRetryCount = extractRetryCount(retryCountKey, msg) || 0;

    if (currentRetryCount > retryCount) {
      this.logger.log(`Message exceeded back-off retry [ MAX: ${retryCount}, ACTUAL: ${currentRetryCount} ]`);
      return of(context).pipe(abandonMessage(), block());
    } else {
      return next.handle()
        .pipe(
          catchError( (error, caught) => {
            const { backOffDelay, message } = createBackoffClone(currentRetryCount, msg, this.config);

            this.logger.log(`Message back-off iteration ${currentRetryCount}, calculated back-off delay: ${backOffDelay}, scheduled to: ${message.scheduledEnqueueTimeUtc.toUTCString()}`);

            return from(context.resolveClient().sendMessages(message))
              .pipe(
                mapTo(context),
                completeMessage(),
                block(),
              );
          }),
        );
    }
  }
}
