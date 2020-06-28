import { SbServerOptions, SbClientOptions } from './options';
import { SbErrorHandler } from '../error-handling';

export interface AttribusConfiguration {
  /**
   * Instances of the classes decorated with service bus entity decorates (@Queue, @Subscriber, @QueueEmitter, @Topic & @SbInterceptor)
   */
  containers: Array<any>;

  /**
   * A list of server configuration objects
   */
  servers: SbServerOptions[];

  /**
   * A list of client configuration objects
   */
  clients?: SbClientOptions[];

  errorHandler?: SbErrorHandler;
}
