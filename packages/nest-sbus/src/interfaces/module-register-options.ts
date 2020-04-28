import { ValueProvider, FactoryProvider, Provider, Type } from '@nestjs/common';
import { SbServerOptions, SbClientOptions } from './options';

export interface SbModuleRegisterOptions {
  /**
   * A list of server configuration objects or a NestJS ValueProvider/FactoryProvider that resolves
   * to a list of server configuration objects.
   */
  servers: SbServerOptions[] | Omit<ValueProvider, 'provide'> | Omit<FactoryProvider, 'provide'>;

  /**
   * A list of client configuration objects or a NestJS ValueProvider/FactoryProvider that resolves
   * to a list of client configuration objects.
   */
  clients?: SbClientOptions[] | Omit<ValueProvider, 'provide'> | Omit<FactoryProvider, 'provide'>;

  /**
   * An optional providers that when set resolves to the value injected to the metadata factory function, when used.
   */
  metaFactoryProvider?: Omit<Exclude<Provider, Type<any>>, 'provide'> | Type<any>;

  providers?: Provider[];
}
