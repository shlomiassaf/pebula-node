import { from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Injectable, CallHandler } from '@nestjs/common';
import { SbInterceptor, SbContext } from '@pebula/nesbus';

import { completeMessage } from '../rx-operators';
import { IdempotentAdapter } from './idempotent-adapter';

enum IdempotentProvision {
  passThrough,
  exists,
  create,
}

@Injectable()
export class SbIdempotentSubscriber implements SbInterceptor {

  constructor(private readonly adapter: IdempotentAdapter) { }

  intercept(context: SbContext, next: CallHandler) {
    const msg = context.getMessage();
    return from(this.checkProvision(context))
      .pipe(
        switchMap( provision => {
          switch (provision) {
            case IdempotentProvision.passThrough:
              return next.handle();
            case IdempotentProvision.exists:
              return of(context).pipe(completeMessage());
            case IdempotentProvision.create:
              return next.handle()
                .pipe( switchMap(() => this.adapter.create(context)) );
          }
        }),
      );
  }

  private async checkProvision(ctx: SbContext): Promise<IdempotentProvision> {
    const isIdempotent = await this.adapter.isIdempotent(ctx);
    if (!isIdempotent) {
      return IdempotentProvision.passThrough;
    }

    const idempotentData = await this.adapter.find(ctx);
    if (!!idempotentData) {
      return IdempotentProvision.exists;
    }
    return IdempotentProvision.create;
  }
}
