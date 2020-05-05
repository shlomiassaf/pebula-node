import { LoggerService } from '@nestjs/common';
import { ServiceBusClient, Sender } from '@azure/service-bus';
import { SbConfigurator } from '../management';
import { SbClientOptions } from '../interfaces';
import { SbChannelManager } from '../resource-manager/';
import { SbEmitterMetadata } from '../metadata';
import { NoopLogger } from '../noop-logger';

const noopLogger = new NoopLogger();

export class SbClient {

  public readonly id?: string;
  protected readonly sbLogger: LoggerService;

  constructor(private readonly options: SbClientOptions,
              private readonly channelManager: SbChannelManager,
              public readonly client: ServiceBusClient,
              public readonly configurator?: SbConfigurator) {
    this.id = options.name;
    this.sbLogger = options.logger || noopLogger;
  }

  async createEmitter(metadata: SbEmitterMetadata) {
    const { metaOptions } = metadata;

    if (this.configurator && !!metaOptions.provision) {
      await metadata.type === 'queue'
        ? this.configurator.verifyQueue(metaOptions.name, metaOptions.provision)
        : this.configurator.verifyTopic(metaOptions.name, metaOptions.provision)
      ;
    }

    const emitter = metadata.type === 'queue'
      ? this.channelManager.getCreateQuerySender(metaOptions.name)
      : this.channelManager.getCreateTopic(metaOptions.name)
    ;

    this.sbLogger.log(`Registered emitter [${metadata.type}]: ${metadata.metaOptions.name}`);

    return emitter;
  }

  async destroy() {
  }
}
