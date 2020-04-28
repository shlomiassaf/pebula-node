// tslint:disable: ban-types
import { GtSchemaContainer } from '../store';

export class GtMethodMetadata {
  static setMetadata(metadataOptions: null,
                     decoratorArgs: { target: object | Function; key?: string | symbol; descriptor?: PropertyDescriptor },
                     container: GtSchemaContainer) {
    const isStatic = typeof decoratorArgs.target === 'function';
    if (isStatic) {
      container.schema.static(decoratorArgs.key as string, decoratorArgs.descriptor.value);
    } else {
      container.schema.method(decoratorArgs.key, decoratorArgs.descriptor.value);
    }
  }
}
