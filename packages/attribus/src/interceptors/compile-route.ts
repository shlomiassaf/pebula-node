import { RouteToCommit } from '../interfaces';
import { EmptyInterceptorsConsumer } from './empty-interceptors-consumer';
import { StaticInterceptorsConsumer } from './static-interceptors-consumer';
import { InterceptorsConsumer } from './interceptors-consumer';

export function createConsumer(routeInstructions: RouteToCommit): InterceptorsConsumer {
  const { interceptors } = routeInstructions.subscriber;
  if (interceptors.length === 0) {
    return new EmptyInterceptorsConsumer();
  } else {
    return new StaticInterceptorsConsumer(interceptors);
  }
}
