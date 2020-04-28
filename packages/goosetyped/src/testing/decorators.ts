// tslint:disable: ban-types

import { SchemaAwareMetadataClass } from '../metadata';
import { GtSchemaContainer } from '../store';

class MetadataDecoratorSpyCatcher<T = any> implements SchemaAwareMetadataClass<T> {
  options: T;
  target: object | Function;
  key?: string | symbol;
  descriptor?: PropertyDescriptor;
  container: GtSchemaContainer;

  setMetadata(options: T,
              decoratorArgs: { target: object | Function; key?: string | symbol; descriptor?: PropertyDescriptor },
              container: GtSchemaContainer) {
    this.options = options;
    this.target = decoratorArgs.target;
    this.key = decoratorArgs.key;
    this.descriptor = decoratorArgs.descriptor;
    this.container = container;
  }
}

export function metadataDecoratorSpy<T>(source: SchemaAwareMetadataClass<T>) {
  const spy = jest.spyOn(source, 'setMetadata');
  const catcher = new MetadataDecoratorSpyCatcher();
  spy.mockImplementationOnce( (...args: any[]) => catcher.setMetadata.apply(catcher, args) );
  return { spy, catcher };
}