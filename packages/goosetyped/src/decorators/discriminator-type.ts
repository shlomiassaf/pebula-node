// tslint:disable: ban-types
import { Document } from 'mongoose';
import { Model } from '../model/model';
import { GtDiscriminatorTypedMetadata } from '../metadata';
import { gtSchemaStore } from '../store';
import { ClassDecoratorOf } from '../utils';

export function GtDiscriminatorType(): ClassDecoratorOf<any, any> {
  return (target: Function) => {
    gtSchemaStore.getCreate(target).setMetadata(GtDiscriminatorTypedMetadata, null, { target });
  }
}
