// tslint:disable: max-classes-per-file
import { Schema, Types, MongooseDocument, SchemaType, SchemaTypeOpts } from 'mongoose';
import { GtSchemaType } from '../decorators';

@GtSchemaType({
  schemaType: Schema.Types.ObjectId,
})
export class ObjectId extends String {

}

@GtSchemaType({
  schemaType: Schema.Types.Array,
  isContainer: true,
  toSchema(reflectedType: typeof SchemaType | Schema, userType?: typeof SchemaType | Schema) {
    const arraySchemaTypeOpts: SchemaTypeOpts<any> = {
     type: [userType],
    };
    return arraySchemaTypeOpts;
  },
})
export class DocumentArray<T extends MongooseDocument> extends Types.DocumentArray<T> {

}
