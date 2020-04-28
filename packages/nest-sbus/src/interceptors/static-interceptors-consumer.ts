import { defer, from as fromPromise, Observable } from 'rxjs';
import { switchMap, mergeAll } from 'rxjs/operators';
import { CallHandler } from '@nestjs/common/interfaces';

import { SbInterceptor } from '../interfaces';
import { SbContext } from '../sb-context';
import { InterceptorsConsumer } from './interceptors-consumer';

export class StaticInterceptorsConsumer extends InterceptorsConsumer {

  constructor(private readonly interceptors: SbInterceptor[]) {
    super();
  }

  async intercept(context: SbContext, next: () => Promise<unknown>) {
    const start$ = defer(() => this.transformDeffered(next));
    return this.buildRunner(this.interceptors, context, start$)();
  }

  private buildRunner(interceptors: SbInterceptor[], context: SbContext, lastPipe: Observable<any>) {
    const len = interceptors.length;
    const nextFn = (i: number) => async () => {
      if (i >= len) {
        return lastPipe;
      }
      const handler: CallHandler = {
        handle: () => fromPromise(nextFn(i + 1)()).pipe(mergeAll()),
      };
      return interceptors[i].intercept(context, handler);
    };
    return nextFn(0);
  }

  protected transformDeffered(next: () => Promise<any>): Observable<any> {
    return fromPromise(next()).pipe(
      switchMap(res => {
        const isDeffered = res instanceof Promise || res instanceof Observable;
        return isDeffered ? res : Promise.resolve(res);
      }),
    );
  }
}
