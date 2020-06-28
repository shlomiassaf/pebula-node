import * as errors from '../errors';
import { SbServerOptions, SbClientOptions, SbMessageEmitter, SbEmitterImp } from '../interfaces';
import { SbServer } from '../server';
import { SbClient } from '../client';
import { SbErrorHandler } from '../error-handling/error-handler';
import { createClientConnector, createServerConnector, isSbEmitterRef } from './utils';
import { SbResourceGroup } from './resource-group';
import { SbChannelManager } from './channel-manager';

const EMPTY_RESOURCE = new SbResourceGroup();

export type ResourceType = 'client' | 'server';

export class SbResourceManager {

  static get(): SbResourceManager { return sbResourceManager || new SbResourceManager(); }

  private defaultResourceGroup: SbResourceGroup;
  private readonly resourceGroups = new Map<string, SbResourceGroup>();

  private constructor() { }

  createClient(clientOptions: SbClientOptions, errorHandler: SbErrorHandler): SbClient {
    const resource = this.getCreateResource(clientOptions.name);
    const { client, configurator } = createClientConnector(clientOptions, this.getServer(clientOptions.name));
    const sbClient = new SbClient(clientOptions, resource.channels, client, errorHandler, configurator);
    this.trySetUniqueResource('client', sbClient, clientOptions.name);
    return sbClient;
  }

  createServer(serverOptions: SbServerOptions, errorHandler: SbErrorHandler): SbServer {
    const resource = this.getCreateResource(serverOptions.name);
    const { client, configurator } = createServerConnector(serverOptions);
    const sbServer = new SbServer(serverOptions, resource.channels, client, errorHandler, configurator);
    this.trySetUniqueResource('server', sbServer, serverOptions.name);
    resource.channels.resourceUpdate();
    return sbServer;
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
