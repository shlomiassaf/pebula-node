// tslint:disable: ban-types
import { GtMethodMetadata } from '../metadata';
import { gtSchemaStore } from '../store';

export function GtMethod(): MethodDecorator {
  return (target: object | Function, key: string, descriptor: PropertyDescriptor) => {
    gtSchemaStore.getCreate(target).setMetadata(GtMethodMetadata, null, { target, key, descriptor });
  };
}
