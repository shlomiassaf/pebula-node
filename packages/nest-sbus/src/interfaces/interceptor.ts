import { Observable } from 'rxjs';
import { CallHandler } from '@nestjs/common';
import { SbContext } from '../sb-context';

export interface SbInterceptor<T = any, R = any> {
  intercept(context: SbContext, next: CallHandler<T>): Observable<R> | Promise<Observable<R>>;
}
