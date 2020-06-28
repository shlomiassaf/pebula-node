import { SbManagementClientAdapterFactory, SbManagementClientAdapter } from '../interfaces';
import { SbManagementClientAtomOptions, SbManagementClientAtomAdapter } from './management-client-atom-adapter';

declare module '../interfaces/management' {
  export interface SbManagementClientOptions {
    atom: SbManagementClientAtomOptions;
  }
}

export function register(registerAdapter: (factory: SbManagementClientAdapterFactory) => void) {
  const factory: SbManagementClientAdapterFactory = {
    supported(options: SbManagementClientAtomOptions): boolean {
      return !!options.credentials.connectionString;
    },
    create(options: SbManagementClientAtomOptions): SbManagementClientAdapter {
      return new SbManagementClientAtomAdapter(options);
    },
  };
  registerAdapter(factory);
}

export { SbManagementClientAtomOptions } from './management-client-atom-adapter';
