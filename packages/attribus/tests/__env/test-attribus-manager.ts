import { AttribusConfiguration, AttribusManagerBase, Ctor } from '@pebula/attribus';
import { ConfigService, MessageStorage } from './services';
import { SimpleQueueContainer, SimpleTopicAndSubscriptionContainer, SimpleBackoffRetryTaskContainer } from './containers';
import { TestErrorHandler } from './test-error-handler';
import { createServerOptions } from './service-bus-setup';
import { globalMetadataStore } from '../../src/metadata-framework/metadata-store';
import { getBaseClass } from '../../src/utils/proto';
import { ManagementUtils } from './utils/management-utils';
import { ServiceBusAtomManagementClient } from '../../src/atom-adapter/atom-client/src/serviceBusAtomManagementClient';

export class AttribusManager extends AttribusManagerBase {

  managementUtils: ManagementUtils;

  public readonly errorHandler = new TestErrorHandler();
  public readonly msgStore = new MessageStorage();
  public readonly simpleQueueContainer = new SimpleQueueContainer(this.msgStore);
  public readonly simpleTopicAndSubscriptionContainer = new SimpleTopicAndSubscriptionContainer(this.msgStore);
  public readonly simpleBackoffRetryTaskContainer = new SimpleBackoffRetryTaskContainer(this.msgStore);
  private attribusConfiguration: AttribusConfiguration;

  constructor(private configService: ConfigService = new ConfigService()) {
    super();
  }
  
  protected async getConfiguration(): Promise<AttribusConfiguration> {
    this.attribusConfiguration = {
      containers: [
        this.simpleQueueContainer,
        this.simpleTopicAndSubscriptionContainer,
        this.simpleBackoffRetryTaskContainer,
      ],
      servers: createServerOptions(this.configService),
      errorHandler: this.errorHandler,
    };
    const { management } = this.configService.sbConnection();
    if (management.type === 'connectionString') {
      this.managementUtils = new ManagementUtils(this.attribusConfiguration.containers, new ServiceBusAtomManagementClient(management.sasConnectionString));
      return this.attribusConfiguration;
    }
    throw new Error('Only ServiceBusAtomManagementClient is supported for tests...');
  }

  protected tryGetTargetMetadata(ctor: Ctor<any>) {
    while (ctor) {
      const metadata = globalMetadataStore.get(ctor);
      if (metadata) {
        return metadata;
      }
      ctor = getBaseClass(ctor) as any;
    }
  }
}
