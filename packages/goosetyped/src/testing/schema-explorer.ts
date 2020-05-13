// tslint:disable: max-classes-per-file
// tslint:disable: ban-types
import { SchemaTypeOpts, SchemaOptions, SchemaType, Schema } from 'mongoose';
import { gtSchemaStore, GtSchemaContainer } from '../store';
import { Ctor } from '../utils';
import { GtColumnMetadata } from '../metadata';

export class SchemaTestExplorer<T, Z extends Ctor<T>> {
  container: GtSchemaContainer;

  constructor(target: Z & Ctor<T>, autoBuild = true) {
    this.container = gtSchemaStore.get(target);
    if (autoBuild) {
      this.container['build']();
    }
  }

  hasColumn(name: keyof T, negate?: boolean): this {
    const p = this.container.schema.path(name as string);
    if (negate) {
      expect(p).toBeUndefined();
    } else {
      expect(p).toBeDefined();
    }
    return this;
  }

  column(name: keyof T) {
    this.hasColumn(name);
    return new SchemaTypeTestExplorer<T, Z>(this, this.container.getColumn(name as any));
  }

  hasOptionValue<TOptKey extends keyof SchemaOptions>(key: TOptKey, value: SchemaOptions[TOptKey]): this  {
    expect(this.container.getSchemaOptions(key)).toEqual(value);
    return this;
  }

  verifyInternalDoc(instance: T) {
    const internalDoc = (instance as any)._doc;
    for (const prop of this.container.localInfo.props.values()) {
      const value = instance[prop.key];
      const internalValue = internalDoc[prop.key];
      if (!prop.local) {
        if (!prop.embedded) {
          expect(value).toEqual(internalValue);
        } else {
          if (prop.columnMeta.isContainer) {
            if(prop.columnMeta.resolvedColumnType.reflectedType.tsType === Map) {
              for (const v of value.values()) {
                const childSchemaTestExplorer = new SchemaTestExplorer(prop.embedded.container.model);
                childSchemaTestExplorer.verifyInternalDoc(v);
              }
            } else {
              for (const v of value) {
                const childSchemaTestExplorer = new SchemaTestExplorer(prop.embedded.container.model);
                childSchemaTestExplorer.verifyInternalDoc(v);
              }
            }
          } else {
            const childSchemaTestExplorer = new SchemaTestExplorer(prop.embedded.container.model);
            childSchemaTestExplorer.verifyInternalDoc(value);
          }
        }
      }
    }
    
  }
  
}

export class SchemaTypeTestExplorer<T, Z extends Ctor<T>> {
  private readonly schemaType: SchemaType;

  constructor(private readonly base: SchemaTestExplorer<T, Z>, private readonly column: GtColumnMetadata) {
    this.schemaType = this.base.container.schema.path(column.key);
  }

  tsType(tsType: Ctor<any>): this {
    expect(tsType).toBe(this.column.resolvedColumnType.underlyingType);
    return this;
  }

  schema(schema: SchemaTypeOpts<any>): this {
    const { resolvedColumnType } = this.column;
    expect(resolvedColumnType.schema).toEqual(schema);
    return this;
  }

  typeInSchema(schema: any): this {
    const { resolvedColumnType } = this.column;
    expect(resolvedColumnType.schema.type).toEqual(schema);
    return this;
  }

  hasOptionValue<TOptKey extends keyof SchemaTypeOpts<any>>(key: TOptKey, value: SchemaTypeOpts<any>[TOptKey]): this  {
    expect(this.schemaType['options'][key]).toEqual(value);
    return this;
  }

  dispose() {
    return this.base;
  }
}
