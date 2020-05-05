import { Module } from '@nestjs/core/injector/module';
import { ModulesContainer } from '@nestjs/core';

import { SbServerOptions, SbClientOptions } from '../interfaces';
import { SbDiscoveryMetadataExplorer } from './metadata-explorer';
import { SbClientDiscoveryService } from './client-discovery-service';
import { SbServerDiscoveryService } from './server-discovery-service';

export class SbDiscoveryService {

  private readonly server: SbServerDiscoveryService;
  private readonly client: SbClientDiscoveryService;

  constructor(private readonly modulesContainer: ModulesContainer,
              private readonly explorer: SbDiscoveryMetadataExplorer,
              serverOptions: SbServerOptions[],
              clientOptions: SbClientOptions[],
              metadataHelper?: any) {
    this.server = new SbServerDiscoveryService(serverOptions, metadataHelper);
    this.client = new SbClientDiscoveryService(clientOptions, metadataHelper);
  }

  init(): void {
    this.server.create();
    this.client.create();
    this.reflectInjectables();
  }

  async discover(): Promise<void> {
    this.server.detectLegacyHandlers();

    // We build the server and client
    // For server, we only store routes, without registering them
    // For client we register.
    //
    // Registering means provision, if set (verify, create) and commit.
    //
    // Commit:
    // For server, commit means connecting to service bus to start listening for messages
    // For client it means creating the Sender, which is lazy so no connection is done.
    //
    // This is why we register and commit clients right away
    await this.build();

    // We commit the routes in the client, at this point all client passed provision.
    // In the process we prioritize the routes so all subscriptions with topic provision will run first
    // in order to avoid a missing topic when registering a subscription.
    await this.server.commitRoutes();
  }

  async destroy() {
    await this.client.destroy();
    await this.server.destroy();
  }

  private async build() {
    const promises = Array.from(this.modulesContainer.values()).map( module => this.parseModule(module) );

    await Promise.all(promises);
  }

  private async parseModule(module: Module) {
    const promises = [...module.providers.values(), ...module.controllers.values()]
      .map( instance => Promise.all([
        this.server.parseProvider(instance, this.explorer),
        this.client.parseProvider(instance, this.explorer),
      ]));

    await Promise.all(promises);
  }

  private reflectInjectables(): void {
    for (const module of this.modulesContainer.values()) {
      for (const instanceWrapper of module.controllers.values()) {
        for (const interceptorContainer of this.explorer.scanForInterceptorHooks(instanceWrapper.instance)) {
          for (const interceptor of interceptorContainer.metadata) {
            if (typeof interceptor === 'function') {
              if (!instanceWrapper.host.injectables.get(interceptor.name)) {
                instanceWrapper.host.addInjectable(interceptor, instanceWrapper.metatype as any);
              }
            }
          }
        }
      }
    }
  }
}
