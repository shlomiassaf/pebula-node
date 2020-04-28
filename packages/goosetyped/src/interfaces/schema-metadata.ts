import * as mongoose from 'mongoose';
import * as mongodb from 'mongodb';

export interface GtSchemaMetadataArgs {

  /**
   * See @link https://mongoosejs.com/docs/guide.html#id
   */
  id?: boolean;

  /**
   * Documents have a toObject method which converts the mongoose document into a plain javascript object.
   * This method accepts a few options. Instead of applying these options on a per-document basis we may declare the options
   * here and have it applied to all of this schemas documents by default.
   *
   * If you want to apply a transformation consider overriding the `toObject` method instead of implementing a transformer function.
   * Call the super method and apply changed to the returned value, this is much better then using an out of context transformer.
   * If you insist on a transformer, consider using the `@GtToObject()` decorator with a dedicated method.
   * In any case, favor using mixins to allow reuse of your code.
   *
   * @link https://mongoosejs.com/docs/4.x/docs/guide.html#toObject
   */
  toObject?: mongoose.DocumentToObjectOptions;

  /**
   * Exactly the same as the `toObject` option but only applies when the documents `toJSON` method is called.
   *
   * If you want to apply a transformation consider overriding the `toJSON` method instead of implementing a transformer function.
   * Call the super method and apply changed to the returned value, this is much better then using an out of context transformer.
   * If you insist on a transformer, consider using the `@GtToJSON()` decorator with a dedicated method.
   * In any case, favor using mixins to allow reuse of your code.
   *
   * @link https://mongoosejs.com/docs/4.x/docs/guide.html#toJSON
   */
  toJSON?: mongoose.DocumentToObjectOptions;
}

export interface GtSubDocumentMetadataArgs extends GtSchemaMetadataArgs {

  /**
   * When true, will not create and `_id` when creating a new object
   * This is equivalent to setting the `_id` property to false in the `Schema` options.
   * @link https://mongoosejs.com/docs/guide.html#_id
   *
   * @defaultValue false
   */
  noId?: boolean;
}

export interface GtDocumentMetadataArgs extends GtSchemaMetadataArgs {
  /**
   * The collection name in the database
   * Optional: When not set, induced from model name
   */
  collection?: string;

  /**
   * Whether to skip initialization
   * Optional: When not set, default's to false
   *
   * Note that this refer to the skipInit from mongoose.
   */
  skipInit?: boolean;

  /**
   * The connection id to use when registering the model.
   * If a connection id is not defined (default behavior) then the model is registered using the default connection.
   *
   * Use `addConnection` to add a new connection to the connection pool available for models.
   *
   * If at the time of creating the model the connection does not exists, it will "wait" for the connection to be added.
   */
  connectionId?: string;

  /**
   * See @link https://mongoosejs.com/docs/guide.html#autoIndex
   */
  autoIndex?: boolean;

  /**
   * See @link https://mongoosejs.com/docs/guide.html#autoCreate
   */
  autoCreate?: boolean;

  /**
   * See @link https://mongoosejs.com/docs/guide.html#bufferCommands
   */
  bufferCommands?: boolean;

  /**
   * See @link https://mongoosejs.com/docs/guide.html#capped
   */
  capped?: boolean | number | { size?: number; max?: number; autoIndexId?: boolean; };

  /**
   * See @link https://mongoosejs.com/docs/guide.html#minimize
   */
  minimize?: boolean;

  /**
   * See @link https://mongoosejs.com/docs/guide.html#collation
   */
  collation?: mongodb.CollationDocument;
}
