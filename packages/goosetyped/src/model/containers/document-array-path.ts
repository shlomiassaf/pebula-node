import { Schema, SchemaTypeOpts, Model, Document } from 'mongoose';
import { EmbeddedDocumentStatic } from '../../mongoose.extend';
import { Ctor } from '../../utils';
import { GtSchemaContainer } from '../../store';
import { extendEmbeddedDocument } from './embedded';
import { SCHEMA_CONTAINER } from './symbol';
import { DocumentArrayPath } from '../../mongoose.extend';

export class GtDocumentArrayPath extends (Schema.Types.DocumentArray as any as Ctor<DocumentArrayPath>) {

  get casterConstructor(): EmbeddedDocumentStatic<any> { return this._casterConstructor; }

  set casterConstructor(value: EmbeddedDocumentStatic<any>) {
    this._casterConstructor = extendEmbeddedDocument(value);
  }

  private _casterConstructor: EmbeddedDocumentStatic<any>; // tslint:disable-line: variable-name
  private readonly [SCHEMA_CONTAINER]: GtSchemaContainer;
  private readonly caster: EmbeddedDocumentStatic<any>;

  constructor(container: GtSchemaContainer, key: string, schema: Schema, typeOpts: SchemaTypeOpts<any>) {
    super(key, schema, typeOpts);
    this[SCHEMA_CONTAINER] = container;
    this.caster = this.casterConstructor;
  }

  cast(value: any, doc: Document, init: boolean, prev?: any, options?: any): any {
    const casted = super.cast([], doc, init, prev, options);

    const arr = !value
      ? []
      : !Array.isArray(value) ? [value] : value
    ;

    const container = this[SCHEMA_CONTAINER];
    for (let i = 0, len = arr.length; i < len; i++) {
      const source = arr[i];
      if (! (source instanceof this.casterConstructor) ) {
        let ctor = this.casterConstructor;
        if (container.localInfo.discriminator) {
          const discriminatorKey = container.localInfo.container.getSchemaOptions('discriminatorKey');
          ctor = this.casterConstructor.discriminators[source[discriminatorKey]];
        }
        casted[i] = new ctor(source, casted, false, null, i, true);
      } else {
        casted[i] = source;
      }
    }

    return casted;
  }

  discriminator<U extends Document>(name: string, schema: Schema, value?: string): Model<U> {
    const created = extendEmbeddedDocument(super.discriminator(name, schema, value));
    this.casterConstructor.discriminators[name] = created;
    return created as any;
  }

  clone() {
    const ctor = this.constructor as any;
    const options = Object.assign({}, this.options);
    const schematype = new ctor(this[SCHEMA_CONTAINER], this.path, this.schema, options, this.schemaOptions);
    schematype.validators = this.validators.slice();
    schematype.Constructor.discriminators = Object.assign({}, this.Constructor.discriminators);
    return schematype;
  }
}
