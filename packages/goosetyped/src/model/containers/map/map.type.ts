import { Types, SchemaType } from 'mongoose';
import { GtSchemaContainer } from '../../../store';
import { SCHEMA_CONTAINER } from '../symbol';

const MongooseMap = Types.Map as any;

export class GtMap extends MongooseMap {

  $__schemaType: any; // tslint:disable-line: variable-name
  private readonly [SCHEMA_CONTAINER]: GtSchemaContainer;
  private readonly discriminatorKey?: string;

  constructor(container: GtSchemaContainer, v: any, path: string, doc: any, schemaType: SchemaType) {
    super(v, path, doc, schemaType);
    if (container.localInfo.discriminator) {
      this.discriminatorKey = container.getSchemaOptions('discriminatorKey');
    }
    this[SCHEMA_CONTAINER] = container;
    const entries = [...this.entries()];
    this.clear();
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }

  set(key: string, value: any) {
    if (!this[SCHEMA_CONTAINER]) {
      return super.$__set(key, value);
    }
    const initialValue = value && !!this.discriminatorKey ? { [this.discriminatorKey]: value[this.discriminatorKey] } : {};
    super.set(key, initialValue);
    const document = this.get(key);
    const container: GtSchemaContainer = this[SCHEMA_CONTAINER];
    container.localInfo.processEmbeddedArrayItemModelInstance(document, value);
  }
}
