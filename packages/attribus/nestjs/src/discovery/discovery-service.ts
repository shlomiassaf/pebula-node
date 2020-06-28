import { Module } from '@nestjs/core/injector/module';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { STATIC_CONTEXT } from '@nestjs/core/injector/constants';
import { ModulesContainer } from '@nestjs/core';
import {
  AttribusConfiguration,
  Extensibility,
  SbInterceptor,
} from '@pebula/attribus';

import { SERVICE_BUS_INTERCEPTORS_METADATA } from '../constants';
import { SbInterceptorMetadataForTarget } from '../metadata-framework';
import { SbDiscoveryMetadataExplorer } from './metadata-explorer';
import { MetadataTransformer } from '../interfaces';

export class SbNestDiscoveryService extends Extensibility.SbDiscoveryService {

  constructor(configuration: AttribusConfiguration,
              private readonly modulesContainer: ModulesContainer,
              private readonly explorer: SbDiscoveryMetadataExplorer,
              private readonly metadataTransformer?: MetadataTransformer,) {
    super(configuration);
    this.configuration.containers = [];
    this.reflectInjectables();
  }

  protected async build() {
    const promises = Array.from(this.modulesContainer.values()).map( module => this.parseModule(module) );
    await Promise.all(promises);
    await super.build();
  }

  private async parseModule(module: Module) {
    const controllers = new Set<any>();
  
    const promises = [...module.providers.values(), ...module.controllers.values()]
      .map( async (instanceWrapper) => {
        if (!instanceWrapper.isNotMetatype && !controllers.has(instanceWrapper.instance)) {
          const metadata = this.tryGetTargetMetadata(instanceWrapper.metatype as any);
          if (metadata) {
            controllers.add(instanceWrapper.instance);
            this.appendInterceptors(metadata, instanceWrapper);
            if (this.metadataTransformer) {
              await this.runMetadataTransform(metadata);
            }
          }
        }
      });

    await Promise.all(promises);

    this.configuration.containers.push(...Array.from(controllers));
  }

  private async runMetadataTransform(metadata: Extensibility.MetadataTarget) {
    const emitters = metadata.getEmitters();

    for (const [key, e] of emitters) {
      if (this.metadataTransformer.topic && e.type === 'topic') {
        const o = await this.metadataTransformer.topic(metadata.target, key, e.metaOptions);
        if (o) {
          e.metaOptions = o;
        }
      } else if (this.metadataTransformer.queue && e.type === 'queue') {
        const o = await this.metadataTransformer.queue(metadata.target, key, e.metaOptions);
        if (o) {
          e.metaOptions = o;
        }
      }
    }

    const subscriptions = metadata.getSubscriptions();

    for (const [key, s] of subscriptions) {
      if (this.metadataTransformer.topicSubscription && s.type === 'subscription') {
        const o = await this.metadataTransformer.topicSubscription(metadata.target, key, s.metaOptions as any);
        if (o) {
          s.metaOptions = o;
        }
      } else if (this.metadataTransformer.queueSubscription && s.type === 'queue') {
        const o = await this.metadataTransformer.queueSubscription(metadata.target, key, s.metaOptions);
        if (o) {
          s.metaOptions = o;
        }
      }
    }
  }

  private appendInterceptors(metadata: Extensibility.MetadataTarget, instanceWrapper: InstanceWrapper) {
    const ctrlInterceptors: SbInterceptorMetadataForTarget = Reflect.getMetadata(SERVICE_BUS_INTERCEPTORS_METADATA, metadata.target.prototype);
    if (ctrlInterceptors) {
      for (const [key, interceptors] of ctrlInterceptors.entries()) {
        const interceptorsToAdd: SbInterceptor[] = [];
        for (const interceptor of interceptors) {
          if (typeof interceptor === 'function') { // class injection
            const interceptorWrapper = instanceWrapper.host.injectables.get(interceptor.name);
            const isStatic = interceptorWrapper.isDependencyTreeStatic();
            if (!isStatic) {
              throw new Error('Transient injections are not currently supported.');
            }
            const resolving = interceptorWrapper.getInstanceByContextId(STATIC_CONTEXT);
            interceptorsToAdd.push(resolving.instance as SbInterceptor);
          } else {
            interceptorsToAdd.push(interceptor);
          }
        }
        if (interceptorsToAdd.length > 0) {
          metadata.addInterceptor(interceptorsToAdd, key);
        }
      }
    }
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
