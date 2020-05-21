import { Ctor, DecoratorArgs } from '../utils';
import { DecoratorStore, Decorator, DecorationTargetContainer, MetadataRecord } from '../decoration';
import { SuiteMetadataArgs, CaseMetadataArgs, NoopMetadataArgs } from '../decorators';
import { SuiteDefinitions } from './suite-definition';
import { RunDefinitions } from './run-definition';

export type AllMetadataArgs = SuiteMetadataArgs | CaseMetadataArgs | NoopMetadataArgs;
export interface MetadataInfo<T extends AllMetadataArgs = AllMetadataArgs> extends MetadataRecord<T> {
}

export class SuiteDefinitionContainer extends DecorationTargetContainer<MetadataInfo> {
  static create(target: Ctor<any>) {
    return new SuiteDefinitionContainer(target);
  }

  private suiteDefinitions: SuiteDefinitions;
  private runDefinitions: RunDefinitions;

  addMetadata<T extends AllMetadataArgs>(decor: Decorator<T>, decoratorArgs: DecoratorArgs, metadata: T) {
    this.runDefinitions = this.suiteDefinitions = undefined;

    const metaInfos = this.metadata.get(decor) || [];

    if (metaInfos.length === 0) {
      this.metadata.set(decor, metaInfos);
    }

    if (!metadata) {
      metadata = {} as any;
    }

    const metadataInfo: MetadataInfo<T> = { metadata: (metadata) as any, decoratorArgs };
    metaInfos.push(metadataInfo);
  }

  getSuiteDefs() {
    if (!this.suiteDefinitions) {
      this.suiteDefinitions = require('./suite-definition').createSuiteDefinitions(this.target, this.metadata); //createSuiteDefinitions(this.target ,this.metadata);
    }
    return this.suiteDefinitions;
  }

  getRunDefs() {
    if (!this.runDefinitions) {
      this.runDefinitions = require('./run-definition').createRunDefinitions(this.target, this.metadata); //createSuiteDefinitions(this.target ,this.metadata);
    }
    return this.runDefinitions;
  }
}

export const decoratorStore = new DecoratorStore(SuiteDefinitionContainer);
