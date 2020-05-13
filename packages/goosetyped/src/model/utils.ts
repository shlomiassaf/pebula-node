import { Schema } from 'mongoose';
import { GtSchemaContainer } from '../store';
import { CTOR_INVOKED } from './constants';
import { GtLocalInfo } from './local-info';

export function hasExtendingSchema(instanceSchema: Schema, extenders: Set<GtSchemaContainer>) {
  for (const base of extenders) {
    if (instanceSchema === base.schema) {
      return true;
    }
  }
  return false;
}

export function findSchemaContainerOfChildDiscriminator(instanceLike: any, localInfo: GtLocalInfo): GtLocalInfo {
  if (localInfo.discriminator && localInfo.discriminator.type === 'root') {
    const discriminatorKey = localInfo.container.getSchemaOptions('discriminatorKey');
    const discriminatorSchemaContainer = localInfo.discriminator.children.get(instanceLike[discriminatorKey]);
    if (!discriminatorSchemaContainer) {
      throw new Error(`Invalid discriminator request for ${localInfo.container.getName()}, discriminator: ${String(instanceLike[discriminatorKey])}`);
    }
    return discriminatorSchemaContainer.localInfo;
  }
  return localInfo;
}

export function checkIfCtorInvoked(instance: any) {
  return !!Reflect.get(instance, CTOR_INVOKED);
}

export function ensureInstanceOf(propValue: any, propLocalInfo: GtLocalInfo) {
  propLocalInfo = findSchemaContainerOfChildDiscriminator(propValue, propLocalInfo);
  if (!checkIfCtorInvoked(propValue)) {
    propValue = new propLocalInfo.cls(propValue);
  }
  return { propLocalInfo, propValue };
}
