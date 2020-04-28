import { Schema, Document, Model } from 'mongoose';
import { GtSchemaContainer } from '../../../store';
import { SCHEMA_CONTAINER } from '../symbol';
import { GtMap } from './map.type';

export class GtMapPath extends Schema.Types.Map {

  of: Schema;
  path: string;

  get caster(): Model<any> {
    return this.$__schemaType.caster;
  }

  private readonly $isSchemaMap: boolean;
  private readonly [SCHEMA_CONTAINER]: GtSchemaContainer;
  private $__schemaType: any; // tslint:disable-line: variable-name

  constructor(container: GtSchemaContainer, key: string, schema: Schema, private options?: any) {
    super(key, options);
    this.of = schema;
    this[SCHEMA_CONTAINER] = container;
  }

  discriminator<U extends Document>(name: string, schema: Schema, value?: string): Model<U> {
    const created = this.$__schemaType.discriminator(name, schema, value);
    return created as any;
  }

  cast(value: any, doc: Document, init: boolean) {
    if (value instanceof GtMap) {
      return value;
    }

    if (init) {
      const map = new GtMap(this[SCHEMA_CONTAINER], {}, this.path, doc, this.$__schemaType);

      if (value instanceof global.Map) {
        for (const key of value.keys()) {
          map.$init(key, map.$__schemaType.cast(value.get(key), doc, true));
        }
      } else {
        for (const key of Object.keys(value)) {
          map.$init(key, map.$__schemaType.cast(value[key], doc, true));
        }
      }

      return map;
    }

    return new GtMap(this[SCHEMA_CONTAINER], value, this.path, doc, this.$__schemaType);
  }

  clone() {
    const ctor = this.constructor as any;
    const options = Object.assign({}, this.options || {});

    const cloned = new ctor(this[SCHEMA_CONTAINER], this.path, this.of, options);
    if (this.$__schemaType != null) {
      cloned.$__schemaType = this.$__schemaType.clone();
    }
  }

}
