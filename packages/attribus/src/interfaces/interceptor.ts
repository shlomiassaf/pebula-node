import { Observable } from 'rxjs';
import { SbContext } from '../sb-context';

export interface NextInterceptor<T = any> {
  /**
   * Returns an `Observable` representing the response stream from the route
   * handler.
   */
  handle(): Observable<T>;
}

export interface SbInterceptor<T = any, R = any> {
  intercept(context: SbContext, next: NextInterceptor<T>): Observable<R> | Promise<Observable<R>>;
}
