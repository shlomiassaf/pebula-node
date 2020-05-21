import { Ctor } from '../../utils';
import { Decorator } from '../../decoration';
import { TouchStone, TouchStoneMetadataArgs, TouchStoneRun } from '../../decorators';
import { MetadataInfo } from '../suite-definition-container';

export interface RunInfo {
  cls: Ctor<TouchStoneRun>;
  metadata: TouchStoneMetadataArgs;
}

export function createRun(metadata: Map<Decorator<any>, MetadataInfo[]>): RunInfo | undefined {
  if (metadata.has(TouchStone)) {
    const rawInfo = metadata.get(TouchStone)[0];
    return {
      cls: rawInfo.decoratorArgs.target as Ctor<any>,
      metadata: rawInfo.metadata,
    };
  }
}
