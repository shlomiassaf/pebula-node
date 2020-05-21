import { DecoratorArgs, toDecoratorArgs, DecoratorUnion, Cls, ensureClass, stringify, isFunction } from '../utils';
import { DecorationTargetContainer } from './decoration-target-container';

export type Decorator<T = any> = (metadataArgs?: T) => DecoratorUnion;
export type DecoratorMetadataArgs<T> = T extends Decorator<infer U> ? U : never;
export interface DecoratorOptions<T = any> {
  /** Use to identify it in errors */
  name?: string;
  allowedTargets?: Array<DecoratorArgs['type']>;
  allowMulti?: true;
  onExecute?: (decoratorArgs: DecoratorArgs, metadata?: T) => T | void;
}

const DECORATOR_OPTIONS = Symbol('DECORATOR_OPTIONS');

const STORES = new Set<DecoratorStore<DecorationTargetContainer>>();

export function extendDecoratorMetadata(base: Cls<any>, target: Cls<any>) {
  for (const s of STORES) {
    if (s.hasTarget(base)) {
      s.getTarget(base).extendDecoratorMetadata(s, target);
    }
  }
}

export class DecoratorStore<T extends DecorationTargetContainer> {

  private decorators = new Set<Decorator>();
  private metadata = new Map<Cls<any>, T>();

  constructor(private readonly containerFactory: { create(target: Cls<any>): T }) { }

  createDecorator<TArgs, TDecor extends DecoratorUnion>(options: DecoratorOptions<TArgs>) {
    const decor = (metadata?: TArgs): TDecor => {
      return ((target: object | Function, key?: string | symbol, indexOrDescriptor?: PropertyDescriptor | number) => {
        this.addMetadata(decor, toDecoratorArgs(target, key, indexOrDescriptor), metadata);
      }) as any;
    }

    decor[DECORATOR_OPTIONS] = options;
    this.decorators.add(decor);

    return decor;
  }

  exists<TArgs>(decor: Decorator<TArgs>): boolean {
    return this.decorators.has(decor);
  }

  hasTarget(type: Cls<any>): boolean {
    return this.metadata.has(type);
  }

  getTarget(type: Cls<any>) {
    return this.metadata.get(type);
  }

  removeTarget(type: Cls<any>): boolean {
    const result = this.metadata.delete(type);
    if (result && this.metadata.size === 0) {
      STORES.delete(this);
    }
    return result;
  }

  getTargets() {
    return this.metadata.values();
  }

  getOptions<TArgs>(decorator: Decorator<TArgs>): DecoratorOptions<TArgs> {
    return decorator[DECORATOR_OPTIONS];
  }

  private addMetadata<TArgs>(decor: Decorator<TArgs>, decoratorArgs: DecoratorArgs, metadata: TArgs) {
    const options = this.getOptions(decor);
    const containerMetadata = this.getContainerMetadata(decoratorArgs);

    const allowMulti = !!options.allowMulti;
  
    if (!allowMulti && containerMetadata.hasMetadataFor(decor)) {
      throw new Error(`Decorator ${stringify(options.name || decor)} can not be applied more then once.`);
    }

    if (Array.isArray(options.allowedTargets) && options.allowedTargets.indexOf(decoratorArgs.type) === -1) {
      throw new Error(`Decorator ${stringify(options.name || decor)} can not be applied on a ${decoratorArgs.type}, only on ${options.allowedTargets.join(', ')}`);
    }

    if (isFunction(options.onExecute)) {
      metadata = options.onExecute(decoratorArgs, metadata) || metadata;
    }

    containerMetadata.addMetadata(decor, decoratorArgs, metadata);
  }

  private getContainerMetadata(decoratorArgs: DecoratorArgs) {
    const cls = ensureClass<unknown>(decoratorArgs.target);
    let suiteDefinitionContainer: T = this.metadata.get(cls);
    if (!suiteDefinitionContainer) {
      if (this.metadata.size === 0) {
        STORES.add(this);
      }
      suiteDefinitionContainer = this.containerFactory.create(cls);
      this.metadata.set(cls, suiteDefinitionContainer);
    }
    return suiteDefinitionContainer;
  }
}
