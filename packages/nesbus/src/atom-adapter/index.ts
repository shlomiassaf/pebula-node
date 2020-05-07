import { SbManagementClientAdapterFactory, SbManagementClientAdapter } from '../interfaces';
import { registerAdapter } from '../management';
import { SbManagementClientAtomOptions, SbManagementClientAtomAdapter } from './management-client-atom-adapter';

declare module '../interfaces/management' {
  export interface SbManagementClientOptions {
    atom: SbManagementClientAtomOptions;
  }
}

export function register() {
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
