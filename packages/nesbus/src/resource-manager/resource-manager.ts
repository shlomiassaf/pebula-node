import { MessageHandler } from '@nestjs/microservices';
import * as errors from '../errors';
import { SbServerOptions, SbClientOptions, SbMessageEmitter, SbEmitterImp } from '../interfaces';
import { SbServer } from '../server';
import { SbClient } from '../client';
import { SbSubscriberMetadata } from '../metadata';
import { SbErrorHandler, SbNoopErrorHandler } from '../error-handling';
import { createClientConnector, createServerConnector, isSbEmitterRef } from './utils';
import { SbResourceGroup } from './resource-group';
import { SbChannelManager } from './channel-manager';

const EMPTY_RESOURCE = new SbResourceGroup();

const DEFAULT_ERROR_HANDLER = new SbNoopErrorHandler();

export type ResourceType = 'client' | 'server';

export class SbResourceManager {

  static get(): SbResourceManager { return sbResourceManager || new SbResourceManager(); }

  get errorHandler(): SbErrorHandler { return this._errorHandler || DEFAULT_ERROR_HANDLER; }
  set errorHandler(value: SbErrorHandler) { this._errorHandler = value; }

  private _errorHandler: SbErrorHandler;
  private defaultResourceGroup: SbResourceGroup;
  private readonly resourceGroups = new Map<string, SbResourceGroup>();
  private readonly legacyMicroserviceHandlers = new Map<SbSubscriberMetadata, MessageHandler>();
  private constructor() { }

  /**
   * Store handlers originated from the `@nestjs/microservices` legacy system, bound to methods only.
   */
  addLegacyHandler(handler: MessageHandler, metadata: SbSubscriberMetadata): void {
    this.legacyMicroserviceHandlers.set(metadata, handler);
  }

  createClient(clientOptions: SbClientOptions): SbClient {
    const resource = this.getCreateResource(clientOptions.name);
    const { client, configurator } = createClientConnector(clientOptions, this.getServer(clientOptions.name));
    const sbClient = new SbClient(clientOptions, resource.channels, client, configurator);
    this.trySetUniqueResource('client', sbClient, clientOptions.name);
    return sbClient;
  }

  createServer(serverId?: string): SbServer {
    const sbServer = new SbServer(serverId);
    this.trySetUniqueResource('server', sbServer, serverId);
    return sbServer;
  }

  registerServer(serverOptions: SbServerOptions): boolean {
    const resource = this.getResource(serverOptions.name);
    if (!resource || !resource.server) {
      // TODO: normalize error
      throw new Error('Invalid SbServerOptions provided in the module, the server id is not registered');
    }

    if (!resource.server.initialized) {
      const { client, configurator } = createServerConnector(serverOptions);
      resource.server.init(serverOptions, resource.channels, client, configurator);
      return true;
    } else {
      return false;
    }
  }

  getClient(name?: string): SbClient | undefined {
    return this.getResource(name, EMPTY_RESOURCE).client;
  }

  getServer(name?: string): SbServer | undefined {
    return this.getResource(name, EMPTY_RESOURCE).server;
  }

  getChannelManager(name?: string): SbChannelManager | undefined {
    const resource = this.getResource(name);
    return resource && resource.channels;
  }

  async destroy(name?: string) {
    const resource = this.getResource(name);
    if (resource) {

      if (!name) {
        this.defaultResourceGroup = undefined;
      } else {
        this.resourceGroups.delete(name);
      }

      await resource.destroy();
    }
  }

  tryResolveEmitter(obj: SbMessageEmitter): SbEmitterImp | undefined {
    if (isSbEmitterRef(obj)) {
      const channelMgr = this.getChannelManager(obj.clientId);
      if (channelMgr) {
        return channelMgr.getTopicSender(obj.name) || channelMgr.getQuerySender(obj.name);
      }
    } else {
      return obj;
    }
  }

  flushLegacyHandler() {
    const legacy = new Map<SbSubscriberMetadata, MessageHandler>(this.legacyMicroserviceHandlers);
    this.legacyMicroserviceHandlers.clear();
    return legacy;
  }

  private trySetUniqueResource<T extends ResourceType>(type: T, value: SbResourceGroup[T], groupName?: string): SbResourceGroup {
    const resource = this.getCreateResource(groupName);
    if (!!resource[type]) {
      throw errors.resourceAlreadyExists(type, groupName);
    }
    resource[type] = value;
    return resource;
  }

  private getCreateResource(name?: string): SbResourceGroup {
    let resource = this.getResource(name);
    if (!resource) {
      resource = new SbResourceGroup(name);
      if (name) {
        this.resourceGroups.set(name, resource);
      } else {
        this.defaultResourceGroup = resource;
      }
    }
    return resource;
  }

  private getResource(name?: string, fallback?: SbResourceGroup): SbResourceGroup | undefined {
    return (name ? this.resourceGroups.get(name) : this.defaultResourceGroup) || fallback;
  }
}

export const sbResourceManager = SbResourceManager.get();
