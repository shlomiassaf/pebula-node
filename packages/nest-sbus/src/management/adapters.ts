
import { SbManagementClientAdapterFactory, SbServerOptions } from '../interfaces';

const adapterFactories: SbManagementClientAdapterFactory[] = [];

export function registerAdapter(factory: SbManagementClientAdapterFactory) {
  adapterFactories.push(factory);
}

export function createManagementClientAdapter(managementOptions: SbServerOptions['management']) {
  const adapterFactory = adapterFactories.find( f => f.supported(managementOptions) );
  if (!adapterFactory) {
    throw new Error('Invalid management configuration, not adapter found');
  }
  return adapterFactory.create(managementOptions);
}
