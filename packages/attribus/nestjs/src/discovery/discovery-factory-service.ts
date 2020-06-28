import { ModulesContainer } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { AttribusConfiguration } from '@pebula/attribus';

import { SbDiscoveryMetadataExplorer } from './metadata-explorer';
import { SbNestDiscoveryService } from './discovery-service';
import { MetadataTransformer } from '../interfaces';

@Injectable()
export class SbDiscoveryFactoryService {

  private readonly explorer = new SbDiscoveryMetadataExplorer();

  constructor(private readonly modulesContainer: ModulesContainer) { }

  create(configuration: AttribusConfiguration, metadataTransformer?: MetadataTransformer) {
    return new SbNestDiscoveryService(configuration, this.modulesContainer, this.explorer, metadataTransformer);
  }
}
