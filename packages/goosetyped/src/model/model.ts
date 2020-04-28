// tslint:disable: ban-types
import {
  Model as MongooseModel,
  Document,
  DocumentQuery,
  FilterQuery,
  SaveOptions,
  Query,
  QueryFindOneAndRemoveOptions,
  QueryFindOneAndUpdateOptions,
  ModelOptions,
  ModelMapReduceOption,
  ModelPopulateOptions,
  Schema,
} from 'mongoose';
import * as mongodb from 'mongodb';
import { Ctor } from '../utils';
import { GT_SUB_DOCUMENT, GT_DOCUMENT } from './constants';

export interface SubDocument { } // tslint:disable-line: no-empty-interface

export interface Resource<T = unknown> {
  [GT_SUB_DOCUMENT]: boolean;
  schema: Schema;

  prototype: SubDocument & T;

  new(doc?: any): SubDocument & T;
}

export interface Model<QueryHelpers = {}> extends MongooseModel<Document, QueryHelpers> {
  [GT_DOCUMENT]: boolean;

  /**
   * Finds a single document by its _id field. findById(id) is almost*
   * equivalent to findOne({ _id: id }). findById() triggers findOne hooks.
   * @param id value of _id to query by
   * @param projection optional fields to return
   */
  findById<T extends Document>(this: Ctor<T>, id: any | string | number,
                               callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findById<T extends Document>(this: Ctor<T>, id: any | string | number, projection: any,
                               callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findById<T extends Document>(this: Ctor<T>, id: any | string | number, projection: any, options: any,
                               callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  /**
   * Creates a Query and specifies a $where condition.
   * @param argument is a javascript string or anonymous function
   */
  $where<T extends Document>(this: Ctor<T>, argument: string | Function): DocumentQuery<T, T, QueryHelpers> & QueryHelpers;

  /**
   * Shortcut for saving one or more documents to the database. MyModel.create(docs)
   * does new MyModel(doc).save() for every doc in docs.
   * Triggers the save() hook.
   */
  create<T extends Document>(this: Ctor<T>, docs: any[], callback?: (err: any, res: T[]) => void): Promise<T[]>;
  create<T extends Document>(this: Ctor<T>, docs: any[], options?: SaveOptions, callback?: (err: any, res: T[]) => void): Promise<T[]>;
  create<T extends Document>(this: Ctor<T>, ...docs: any[]): Promise<T>;
  create<T extends Document>(this: Ctor<T>, ...docsWithCallback: any[]): Promise<T>;

  /**
   * Finds documents.
   * @param projection optional fields to return
   */
  find<T extends Document>(this: Ctor<T>, callback?: (err: any, res: T[]) => void): DocumentQuery<T[], T, QueryHelpers> & QueryHelpers;
  find<T extends Document>(this: Ctor<T>, conditions: FilterQuery<T>,
                           callback?: (err: any, res: T[]) => void): DocumentQuery<T[], T, QueryHelpers> & QueryHelpers;
  find<T extends Document>(this: Ctor<T>, conditions: FilterQuery<T>, projection?: any | null,
                           callback?: (err: any, res: T[]) => void): DocumentQuery<T[], T, QueryHelpers> & QueryHelpers;
  find<T extends Document>(this: Ctor<T>, conditions: FilterQuery<T>, projection?: any | null, options?: any | null,
                           callback?: (err: any, res: T[]) => void): DocumentQuery<T[], T, QueryHelpers> & QueryHelpers;

  /**
   * Issue a mongodb findAndModify remove command by a document's _id field.
   * findByIdAndRemove(id, ...) is equivalent to findOneAndRemove({ _id: id }, ...).
   * Finds a matching document, removes it, passing the found document (if any) to the callback.
   * Executes immediately if callback is passed, else a Query object is returned.
   *
   * If mongoose option 'useFindAndModify': set to false it uses native findOneAndUpdate() rather than deprecated findAndModify().
   * https://mongoosejs.com/docs/api.html#mongoose_Mongoose-set
   *
   * Note: same signatures as findByIdAndDelete
   *
   * @param id value of _id to query by
   */
  findByIdAndRemove<T extends Document>(this: Ctor<T>): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findByIdAndRemove<T extends Document>(this: Ctor<T>,
                                        id: any | number | string,
                                        callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findByIdAndRemove<T extends Document>(this: Ctor<T>, id: any | number | string, options: QueryFindOneAndRemoveOptions,
                                        callback?: (err: any, res: mongodb.FindAndModifyWriteOpResultObject<T | null>) => void)
                                          : Query<mongodb.FindAndModifyWriteOpResultObject<T | null>> & QueryHelpers;
  findByIdAndRemove<T extends Document>(this: Ctor<T>,
                                        id: any | number | string,
                                        options: QueryFindOneAndRemoveOptions,
                                        callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  /**
   * Issue a mongodb findOneAndDelete command by a document's _id field.
   * findByIdAndDelete(id, ...) is equivalent to findByIdAndDelete({ _id: id }, ...).
   * Finds a matching document, removes it, passing the found document (if any) to the callback.
   * Executes immediately if callback is passed, else a Query object is returned.
   *
   * Note: same signatures as findByIdAndRemove
   *
   * @param id value of _id to query by
   */
  findByIdAndDelete<T extends Document>(this: Ctor<T>): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findByIdAndDelete<T extends Document>(this: Ctor<T>, id: any | number | string,
                                        callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findByIdAndDelete<T extends Document>(this: Ctor<T>, id: any | number | string, options: QueryFindOneAndRemoveOptions,
                                        callback?: (err: any, res: mongodb.FindAndModifyWriteOpResultObject<T | null>) => void)
                                          : Query<mongodb.FindAndModifyWriteOpResultObject<T | null>> & QueryHelpers;
  findByIdAndDelete<T extends Document>(this: Ctor<T>,
                                        id: any | number | string,
                                        options: QueryFindOneAndRemoveOptions,
                                        callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  /**
   * Issues a mongodb findAndModify update command by a document's _id field. findByIdAndUpdate(id, ...)
   * is equivalent to findOneAndUpdate({ _id: id }, ...).
   *
   * If mongoose option 'useFindAndModify': set to false it uses native findOneAndUpdate() rather than deprecated findAndModify().
   * https://mongoosejs.com/docs/api.html#mongoose_Mongoose-set
   *
   * @param id value of _id to query by
   */
  findByIdAndUpdate<T extends Document>(this: Ctor<T>): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findByIdAndUpdate<T extends Document>(this: Ctor<T>, id: any | number | string, update: any,
                                        callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findByIdAndUpdate<T extends Document>(this: Ctor<T>, id: any | number | string, update: any,
                                        options: { rawResult: true } & { upsert: true } & { new: true } & QueryFindOneAndUpdateOptions,
                                        callback?: (err: any, res: T) => void): DocumentQuery<T, T, QueryHelpers> & QueryHelpers;
  findByIdAndUpdate<T extends Document>(this: Ctor<T>, id: any | number | string, update: any,
                                        options: { upsert: true, new: true } & QueryFindOneAndUpdateOptions,
                                        callback?: (err: any, res: mongodb.FindAndModifyWriteOpResultObject<T>) => void)
                                        : Query<mongodb.FindAndModifyWriteOpResultObject<T>> & QueryHelpers;
  findByIdAndUpdate<T extends Document>(this: Ctor<T>, id: any | number | string, update: any,
                                        options: { rawResult: true } & QueryFindOneAndUpdateOptions,
                                        callback?: (err: any, res: mongodb.FindAndModifyWriteOpResultObject<T | null>) => void)
                                          : Query<mongodb.FindAndModifyWriteOpResultObject<T | null>> & QueryHelpers;
  findByIdAndUpdate<T extends Document>(this: Ctor<T>, id: any | number | string, update: any,
                                        options: QueryFindOneAndUpdateOptions,
                                        callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  /**
   * Finds one document.
   * The conditions are cast to their respective SchemaTypes before the command is sent.
   * @param projection optional fields to return
   */
  findOne<T extends Document>(this: Ctor<T>, conditions?: any,
                              callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findOne<T extends Document>(this: Ctor<T>, conditions: any, projection: any,
                              callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findOne<T extends Document>(this: Ctor<T>, conditions: any, projection: any, options: any,
                              callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  /**
   * Issue a mongodb findAndModify remove command.
   * Finds a matching document, removes it, passing the found document (if any) to the callback.
   * Executes immediately if callback is passed else a Query object is returned.
   *
   * If mongoose option 'useFindAndModify': set to false it uses native findOneAndUpdate() rather than deprecated findAndModify().
   * https://mongoosejs.com/docs/api.html#mongoose_Mongoose-set
   *
   * Note: same signatures as findOneAndDelete
   *
   */
  findOneAndRemove<T extends Document>(this: Ctor<T>): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findOneAndRemove<T extends Document>(this: Ctor<T>, conditions: any,
                                       callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findOneAndRemove<T extends Document>(this: Ctor<T>, conditions: any, options: { rawResult: true } & QueryFindOneAndRemoveOptions,
                                       callback?: (err: any, doc: mongodb.FindAndModifyWriteOpResultObject<T | null>, res: any) => void)
                                        : Query<mongodb.FindAndModifyWriteOpResultObject<T | null>> & QueryHelpers;
  findOneAndRemove<T extends Document>(this: Ctor<T>,
                                       conditions: any,
                                       options: QueryFindOneAndRemoveOptions,
                                       callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  /**
   * Issues a mongodb findOneAndDelete command.
   * Finds a matching document, removes it, passing the found document (if any) to the
   * callback. Executes immediately if callback is passed.
   *
   * Note: same signatures as findOneAndRemove
   *
   */
  findOneAndDelete<T extends Document>(this: Ctor<T>): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findOneAndDelete<T extends Document>(this: Ctor<T>, conditions: any,
                                       callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findOneAndDelete<T extends Document>(this: Ctor<T>, conditions: any, options: { rawResult: true } & QueryFindOneAndRemoveOptions,
                                       callback?: (err: any, doc: mongodb.FindAndModifyWriteOpResultObject<T | null>, res: any) => void)
                                         : Query<mongodb.FindAndModifyWriteOpResultObject<T | null>> & QueryHelpers;
  findOneAndDelete<T extends Document>(this: Ctor<T>,
                                       conditions: any,
                                       options: QueryFindOneAndRemoveOptions,
                                       callback?: (err: any, res: T | null) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  /**
   * Issues a mongodb findAndModify update command.
   * Finds a matching document, updates it according to the update arg, passing any options,
   * and returns the found document (if any) to the callback. The query executes immediately
   * if callback is passed else a Query object is returned.
   *
   + If mongoose option 'useFindAndModify': set to false it uses native findOneAndUpdate() rather than the deprecated findAndModify().
   + https://mongoosejs.com/docs/api.html#mongoose_Mongoose-set
   */
  findOneAndUpdate<T extends Document>(this: Ctor<T>): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findOneAndUpdate<T extends Document>(this: Ctor<T>, conditions: any, update: any,
                                       callback?: (err: any, doc: T | null, res: any) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;
  findOneAndUpdate<T extends Document>(this: Ctor<T>, conditions: any, update: any,
                                       options: { rawResult : true } & { upsert: true, new: true } & QueryFindOneAndUpdateOptions,
                                       callback?: (err: any, doc: mongodb.FindAndModifyWriteOpResultObject<T>, res: any) => void)
                                         : Query<mongodb.FindAndModifyWriteOpResultObject<T>> & QueryHelpers;
  findOneAndUpdate<T extends Document>(this: Ctor<T>, conditions: any, update: any,
                                       options: { upsert: true, new: true } & QueryFindOneAndUpdateOptions,
                                       callback?: (err: any, doc: T, res: any) => void): DocumentQuery<T, T, QueryHelpers> & QueryHelpers;
  findOneAndUpdate<T extends Document>(this: Ctor<T>, conditions: any, update: any,
                                       options: { rawResult: true } & QueryFindOneAndUpdateOptions,
                                       callback?: (err: any, doc: mongodb.FindAndModifyWriteOpResultObject<T | null>, res: any) => void)
                                         : Query<mongodb.FindAndModifyWriteOpResultObject<T | null>> & QueryHelpers;
  findOneAndUpdate<T extends Document>(this: Ctor<T>, conditions: any, update: any,
                                       options: QueryFindOneAndUpdateOptions,
                                       callback?: (err: any, doc: T | null, res: any) => void): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  /**
   * Implements $geoSearch functionality for Mongoose
   * @param conditions an object that specifies the match condition (required)
   * @param options for the geoSearch, some (near, maxDistance) are required
   * @param callback optional callback
   */
  geoSearch<T extends Document>(this: Ctor<T>,
                                conditions: any,
                                options: {
                                  /** x,y point to search for */
                                  near: number[];
                                  /** the maximum distance from the point near that a result can be */
                                  maxDistance: number;
                                  /** The maximum number of results to return */
                                  limit?: number;
                                  /** return the raw object instead of the Mongoose Model */
                                  lean?: boolean;
                                },
                                callback?: (err: any, res: T[]) => void): DocumentQuery<T[], T, QueryHelpers> & QueryHelpers;

  /**
   * Shortcut for creating a new Document from existing raw data,
   * pre-saved in the DB. The document returned has no paths marked
   * as modified initially.
   */
  hydrate<T extends Document>(this: Ctor<T>, obj: any): T;

  /**
   * Shortcut for validating an array of documents and inserting them into
   * MongoDB if they're all valid. This function is faster than .create()
   * because it only sends one operation to the server, rather than one for each
   * document.
   * This function does not trigger save middleware.
   * @param docs Documents to insert.
   * @param options Optional settings.
   * @param options.ordered  if true, will fail fast on the first error encountered.
   *        If false, will insert all the documents it can and report errors later.
   * @param options.rawResult if false, the returned promise resolves to the documents that passed mongoose document validation.
   *        If `false`, will return the [raw result from the MongoDB driver](http://mongodb.github.io/node-mongodb-native/2.2/api/Collection.html#~insertWriteOpCallback)
   *        with a `mongoose` property that contains `validationErrors` if this is an unordered `insertMany`.
   */
  insertMany<T extends Document>(this: Ctor<T>, docs: any[], callback?: (error: any, docs: T[]) => void): Promise<T[]>;
  insertMany<T extends Document>(this: Ctor<T>, docs: any[],
                                 options?: { ordered?: boolean, rawResult?: boolean } & ModelOptions,
                                 callback?: (error: any, docs: T[]) => void): Promise<T[]>;
  insertMany<T extends Document>(this: Ctor<T>, doc: any, callback?: (error: any, doc: T) => void): Promise<T>;
  insertMany<T extends Document>(this: Ctor<T>, doc: any,
                                 options?: { ordered?: boolean, rawResult?: boolean } & ModelOptions,
                                 callback?: (error: any, doc: T) => void): Promise<T>;

  /**
   * Performs any async initialization of this model against MongoDB.
   * This function is called automatically, so you don't need to call it.
   * This function is also idempotent, so you may call it to get back a promise
   * that will resolve when your indexes are finished building as an alternative
   * to `MyModel.on('index')`
   * @param callback optional
   */
  init<T extends Document>(this: Ctor<T>, callback?: (err: any) => void): Promise<T>;

  /**
   * Executes a mapReduce command.
   * @param o an object specifying map-reduce options
   * @param callbackoptional callback
   */
  mapReduce<Key, Value, T extends Document>(this: Ctor<T>,
                                            o: ModelMapReduceOption<T, Key, Value>,
                                            callback?: (err: any, res: any) => void): Promise<any>;

  /**
   * Populates document references.
   * @param docs Either a single document or array of documents to populate.
   * @param options A hash of key/val (path, options) used for population.
   * @param callback Optional callback, executed upon completion. Receives err and the doc(s).
   */
  populate<T extends Document>(this: Ctor<T>,
                               docs: any[],
                               options: ModelPopulateOptions | ModelPopulateOptions[],
                               callback?: (err: any, res: T[]) => void): Promise<T[]>;
  populate<T>(docs: any, options: ModelPopulateOptions | ModelPopulateOptions[],
              callback?: (err: any, res: T) => void): Promise<T>;

}
