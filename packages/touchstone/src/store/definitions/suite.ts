import { Ctor } from '../../utils';
import { Decorator } from '../../decoration';
import { Suite, SuiteMetadataArgs } from '../../decorators/suite';
import { MetadataInfo } from '../suite-definition-container';

export interface SuiteInfo {
  cls: Ctor<any>;
  metadata: SuiteMetadataArgs;
}

export function createSuite(metadata: Map<Decorator<any>, MetadataInfo[]>): SuiteInfo | undefined {
  if (metadata.has(Suite)) {
    const rawInfo = metadata.get(Suite)[0];
    return {
      cls: rawInfo.decoratorArgs.target as Ctor<any>,
      metadata: rawInfo.metadata,
    };
  }
}
