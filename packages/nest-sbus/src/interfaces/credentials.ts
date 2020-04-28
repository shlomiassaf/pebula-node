import { ServiceBusClient, TokenProvider } from '@azure/service-bus';

// Client

export interface ServiceBusAadTokenCredentials {
  host: string;
  credentials: Parameters<typeof ServiceBusClient['createFromAadTokenCredentials']>[1];
}

export interface ServiceBusTokenProviderCredentials {
  host: string;
  tokenProvider: TokenProvider;
}

export interface ServiceBusConnectionStringCredentials {
  connectionString: string;
}

export type SbCredentials = ServiceBusAadTokenCredentials | ServiceBusTokenProviderCredentials | ServiceBusConnectionStringCredentials;

// Management

export interface ServiceBusManagementAadTokenCredentials extends ServiceBusAadTokenCredentials {
  resourceGroupName: string;
  namespace: string;
  subscriptionId: string;
}

export type SbManagementCredentials =
  | ServiceBusManagementAadTokenCredentials
  | ServiceBusConnectionStringCredentials;
