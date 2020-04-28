import * as mongoose from 'mongoose';
import { Ctor } from '../utils/types';

/**
 * Represents an instance of a document array Schema for a property
 */
export interface SchemaTypePath<TOpts = any> extends mongoose.SchemaType {
  OptionsConstructor: Ctor<TOpts>;

  options: any;
  path: any;
  validators: any[];

  /**
   * Defines this path as immutable. Mongoose prevents you from changing
   * immutable paths unless the parent document has [`isNew: true`](/docs/api.html#document_Document-isNew).
   *
   * ####Example:
   *
   *     const schema = new Schema({
   *       name: { type: String, immutable: true },
   *       age: Number
   *     });
   *     const Model = mongoose.model('Test', schema);
   *
   *     await Model.create({ name: 'test' });
   *     const doc = await Model.findOne();
   *
   *     doc.isNew; // false
   *     doc.name = 'new name';
   *     doc.name; // 'test', because `name` is immutable
   *
   * Mongoose also prevents changing immutable properties using `updateOne()`
   * and `updateMany()` based on [strict mode](/docs/guide.html#strict).
   *
   * ####Example:
   *
   *     // Mongoose will strip out the `name` update, because `name` is immutable
   *     Model.updateOne({}, { $set: { name: 'test2' }, $inc: { age: 1 } });
   *
   *     // If `strict` is set to 'throw', Mongoose will throw an error if you
   *     // update `name`
   *     const err = await Model.updateOne({}, { name: 'test2' }, { strict: 'throw' }).
   *       then(() => null, err => err);
   *     err.name; // StrictModeError
   *
   *     // If `strict` is `false`, Mongoose allows updating `name` even though
   *     // the property is immutable.
   *     Model.updateOne({}, { name: 'test2' }, { strict: false });
   *
   * @param {Boolean} bool
   * @return {SchemaType} this
   * @see isNew /docs/api.html#document_Document-isNew
   * @api public
   */
  immutable(value: boolean): this;

  /**
   * Set the model that this path refers to. This is the option that [populate](https://mongoosejs.com/docs/populate.html)
   * looks at to determine the foreign collection it should query.
   *
   * ####Example:
   *     const userSchema = new Schema({ name: String });
   *     const User = mongoose.model('User', userSchema);
   *
   *     const postSchema = new Schema({ user: mongoose.ObjectId });
   *     postSchema.path('user').ref('User'); // By model name
   *     postSchema.path('user').ref(User); // Can pass the model as well
   *
   *     // Or you can just declare the `ref` inline in your schema
   *     const postSchema2 = new Schema({
   *       user: { type: mongoose.ObjectId, ref: User }
   *     });
   *
   * @param ref either a model name, a [Model](https://mongoosejs.com/docs/models.html), or a function that returns a model name or model.
   * @return {SchemaType} this
   * @api public
   */
  ref(ref: string | mongoose.Model<any> | Ctor<any>): this;

  /**
   * Gets the default value
   *
   * @param {Object} scope the scope which callback are executed
   * @param {Boolean} init
   * @api private
   */
  getDefault(scope: any, init?: boolean): any;

  /**
   * Applies setters
   *
   * @param {Object} value
   * @param {Object} scope
   * @param {Boolean} init
   * @api private
   */
  applySetters(value: any, scope: any, init: boolean, priorVal?: any, options?: any): any;

  /**
   * Applies getters to a value
   *
   * @param {Object} value
   * @param {Object} scope
   * @api private
   */
  applyGetters(value: any, scope: any): any;

  clone(): this;

  /**
   * Casts values for set().
   *
   * @param value
   * @param doc document that triggers the casting
   * @param init whether this is an initialization cast
   * @api private
   */
  cast(value: any, doc: mongoose.Document, init: boolean): any;
}
