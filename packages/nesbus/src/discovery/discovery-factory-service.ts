import { ModulesContainer } from '@nestjs/core';
import { Injectable } from '@nestjs/common';

import { SbServerOptions, SbClientOptions } from '../interfaces';
import { SbDiscoveryMetadataExplorer } from './metadata-explorer';
import { SbDiscoveryService } from './discovery-service';

@Injectable()
export class SbDiscoveryFactoryService {

  private readonly explorer = new SbDiscoveryMetadataExplorer();

  constructor(private readonly modulesContainer: ModulesContainer) { }

  create(serverOptions: SbServerOptions[],
         clientOptions: SbClientOptions[],
         metadataHelper?: any,): SbDiscoveryService {
    return new SbDiscoveryService(this.modulesContainer, this.explorer, serverOptions, clientOptions, metadataHelper);
  }
}
