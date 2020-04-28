// tslint:disable: ban-types
import { GtSchemaContainer } from '../store';

function detectedEmbeddedDiscriminators(container: GtSchemaContainer) {
  for (const baseClass of container.hierarchy.base.values()) {
    const key = baseClass.schema.get('discriminatorKey');
    if (key) {
      return baseClass;
    }
  }
}

export class GtDiscriminatorTypedMetadata {
  static setMetadata(metadataOptions: null,
                     decoratorArgs: { target: object | Function; key?: string | symbol; descriptor?: PropertyDescriptor },
                     container: GtSchemaContainer) {
    const discriminatorBase = detectedEmbeddedDiscriminators(container);
    if (!discriminatorBase) {
      throw new Error('Invalid discriminator configuration, base class is an unknown type');
    }
    container.localInfo.markChildDiscriminator(discriminatorBase.localInfo);
  }
}
