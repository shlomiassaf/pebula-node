// tslint:disable: ban-types
import { gtSchemaStore, GtSchemaContainer } from '../store';
import { PropertyDecoratorOf } from '../utils/types';
import { GT_DISCRIMINATOR_ROOT } from '../model/constants';

export function GtDiscriminator(): PropertyDecoratorOf<string> {
  return (target: object, key: string) => {
    const container = gtSchemaStore.getCreate(target);
    container.setSchemaOptions('discriminatorKey', key as string);
    container.localInfo.discriminator = { type: 'root', children: new Map<string, GtSchemaContainer>() };
    // setting this will allow us to detect it quickly on children
    // because they inherit so it will get copied but the value will always equal the root making it easy to detect children.
    container.localInfo.cls[GT_DISCRIMINATOR_ROOT] = container.localInfo.cls;
  };
}
