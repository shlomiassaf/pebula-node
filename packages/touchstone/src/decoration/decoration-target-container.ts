import { Cls, DecoratorArgs, extendDesignMetadata, PropertyDecoratorArgs } from '../utils';
import { Decorator, DecoratorStore } from './decorator-store';

export interface MetadataRecord<T = any> {
  metadata: T;
  decoratorArgs: DecoratorArgs;
}

export abstract class DecorationTargetContainer<TMetaRec extends MetadataRecord = MetadataRecord> {
  protected metadata = new Map<Decorator, TMetaRec[]>();

  constructor(public readonly target: Cls<any>) { }

  abstract addMetadata<TArgs>(decor: Decorator<TArgs>, decoratorArgs: DecoratorArgs, metadata: TArgs): void;

  extendDecoratorMetadata(store: DecoratorStore<DecorationTargetContainer>, target: Cls<any>) {
    const targetContainer = store.getTarget(target);
    for (const [decor, metadataInfos] of this.metadata.entries()) {
      const decorMetadata = targetContainer ? targetContainer.metadata.get(decor) || [] : [];
      for (const meta of metadataInfos) {
        if (meta.decoratorArgs.type === 'class') {
          if (decorMetadata.length === 0) {
            (decor(meta.metadata) as any)(target);
          }
        } else {
          const key = meta.decoratorArgs.key;
          const tBase = meta.decoratorArgs.target;
          let tTarget: object | Function;
          let descriptor: PropertyDescriptor;
          
          switch (meta.decoratorArgs.type) {
            case 'methodStatic':
              tTarget = target;
              descriptor = meta.decoratorArgs.descriptor;
              break;
            case 'method':
              tTarget = target.prototype;
              descriptor = meta.decoratorArgs.descriptor;
              break;
            case 'propertyStatic':
              tTarget = target;
              break;
            case 'property':
              tTarget = target.prototype;
              break;
          }
          if (!decorMetadata.find( d => d.decoratorArgs.target === tBase && (d.decoratorArgs as PropertyDecoratorArgs).key === key)) {
            (decor(meta.metadata) as any)(tTarget, key, descriptor);
            extendDesignMetadata(tBase, tTarget, key);
          }
        }
      }
    }
  }

  hasMetadataFor(decor: Decorator): boolean {
    return this.metadata.has(decor);
  }

}