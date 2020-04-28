import { ServiceBusClientOptions } from '@azure/service-bus';
import { LoggerService } from '@nestjs/common';

import { SbCredentials } from './credentials';
import { SbManagementClientOptions } from './management';

export interface SbConnectionOptions<TCredentials, TOptions> {
  /**
   * Connection credentials used to authenticate & authorize with service bus.
   */
  credentials: TCredentials;
  /**
   * Connection specific options
   */
  options?: TOptions;
}

export interface SbServerOptions {
  /**
   * A unique name given to this server which allow subscriber filter and other paring capabilities.
   * When not set, the server is defined as the default server used for all events defined without filtering.
   *
   * Additionally, the name is used to pair server & client together to allow sharing of resources (connections/senders/receivers).
   * Since by default all names are empty, all servers & clients are shared.
   *
   * Note that the name most be unique across all running instances (runtime scoped, not NestJS application scope)
   * This means that only one default (empty name) server is allowed.
   *
   * If a duplicate name is detected the process will throw.
   */
  name?: string;

  client: SbConnectionOptions<SbCredentials, ServiceBusClientOptions>;

  management?: SbManagementClientOptions;

  logger?: LoggerService;
}

/**
 * Options for `SbClient`
 *
 * # Sharing resources with `SgServer`:
 *
 * When both `SgServer` and `SgClient` are used you can link the two together to allow sharing of resources.
 * This will allow sharing the connection, including credentials for both underlying client & managements connections.
 *
 * To link `SgServer` and `SgClient`:
 *
 *   - Make sure that the identifiers `SbServerOptions.name` & `SgClientOptions.name` are identical.
 *   - Make sure `SgClientOptions.client` is not set.
 *
 * By default, both identifiers are not set which means that the link is activated unless `SgClientOptions.client` is set.
 *
 * Note that this apply to `SgClientOptions.management` as well.
 *
 * If you wonder why we need to pair via id, see https://github.com/nestjs/nest/issues/4410#issuecomment-603685569.
 * Basically, injection is now available in a microservice `Server` so we can't share resources in a transparent way.
 */
export interface SbClientOptions {
  /**
   * A unique name given to this client which allow referencing a specific client to be used by an emitter.
   * In addition, the name is used to pair server & client together to allow sharing of resources (connections/senders/receivers).
   *
   * By default the name is undefined, which is the identifier for the default client.
   * In most cases a multi-client environment is not required and you will not use the name, this means that:
   *
   * - All servers & clients are shared (unless a `client` is specified explicitly)
   * - All emitters will use the default client (unless an emitter specify a client reference explicitly)
   *
   * Note that the name most be unique across all running instances (runtime scoped, not NestJS application scope)
   * This means that only one default (empty name) server is allowed.
   * If a duplicate name is detected the process will throw.
   */
  name?: string;

  /**
   * Client information used to authenticate, authorize & connect with service bus.
   *
   * The information might be optional if the client is shared with an active `SgServer` instance.
   * In that case, resources are shared between the two.
   *
   * See `SbClientOptions.name` for more information.
   */
  client?: SbConnectionOptions<SbCredentials, ServiceBusClientOptions>;

  management?: SbManagementClientOptions;

  logger?: LoggerService;
}
