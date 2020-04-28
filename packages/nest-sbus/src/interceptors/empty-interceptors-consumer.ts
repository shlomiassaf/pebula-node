import { SbContext } from '../sb-context';
import { InterceptorsConsumer } from './interceptors-consumer';

export class EmptyInterceptorsConsumer extends InterceptorsConsumer {
  async intercept(context: SbContext, next: () => Promise<unknown>) {
    return next();
  }
}
