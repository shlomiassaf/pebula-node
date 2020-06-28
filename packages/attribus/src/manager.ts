import { SbDiscoveryService } from './discovery';
import { AttribusConfiguration } from './interfaces';
import { SbNoopErrorHandler } from './error-handling/noop-error-handler';

const DiscoveryServiceSymbol = Symbol('SbDiscoveryService');
const DEFAULT_ERROR_HANDLER = new SbNoopErrorHandler();

export abstract class AttribusManagerBase {
  private [DiscoveryServiceSymbol]: SbDiscoveryService;

  protected abstract async getConfiguration(): Promise<AttribusConfiguration>;

  protected async createDiscoveryService(configuration: AttribusConfiguration) {
    return new SbDiscoveryService(configuration);
  }

  async start() {
    const configuration = await this.getConfiguration();
    if (!configuration.errorHandler) {
      configuration.errorHandler = DEFAULT_ERROR_HANDLER; 
    }
    const discovery = await this.createDiscoveryService(configuration);

    this[DiscoveryServiceSymbol] = discovery;
    discovery.init();

    await discovery.discover();
  }

  async close() {
    await this[DiscoveryServiceSymbol].destroy();
  }
}
