// tslint:disable: ban-types
import { Document } from 'mongoose';
import { Model, Resource } from '../model/model';
import { GtSubDocumentMetadataArgs, GtDocumentMetadataArgs } from '../interfaces';
import { GtSubDocumentMetadata, GtDocumentMetadata } from '../metadata';
import { gtSchemaStore } from '../store';
import { ClassDecoratorOf } from '../utils';

export function GtDocument(metadata?: GtDocumentMetadataArgs): ClassDecoratorOf<Document, Model> {
  return (target: Function) => {
    gtSchemaStore.getCreate(target).setMetadata(GtDocumentMetadata, metadata || {}, { target });
  };
}

export function GtSubDocument(metadata?: GtSubDocumentMetadataArgs): ClassDecoratorOf<any, Resource> {
  return (target: Function) => {
    gtSchemaStore.getCreate(target).setMetadata(GtSubDocumentMetadata, metadata || {}, { target });
  };
}
