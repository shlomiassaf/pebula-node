import { SbContext } from '../sb-context';

export abstract class InterceptorsConsumer {
  abstract async intercept(context: SbContext, next: () => Promise<unknown>): Promise<unknown>;
}
