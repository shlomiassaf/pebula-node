import { Schema, SchemaTypeOpts } from 'mongoose';
import { GtSchemaTypeMetadataArgs } from '../interfaces';
import { Ctor } from '../utils';

/**
 * Represents a matching between a runtime type (TS reflection) and a mongoose type.
 *
 * The `tsType` is the actual runtime type used by a column.
 * The `type` is an object representing a mongoose column type (i.e. Schema` or `SchemaType`)
 *
 * If the mongoose type is `Schema`, the `type` property will reference it directly.
 * If the mongoose type is `SchemaType` the `type` property will be an object the hold the `SchemaType`.
 *
 * The object that "holds" the `SchemaType` can be `GtSchemaTypeSingleMetadataArgs` or `GtSchemaTypeContainerMetadataArgs`
 * The distinction exists to separate between single item types and collection types (array, map, etc...).
 * In any case, both interfaces contain the `schemaType` property which holds a direct reference to the `SchemaType`.
 * If the referenced `SchemaType` is a container type (e.g. Map, Array) it will also contain 2 additional properties.
 * - `isContainer`: always set to true, used to distinguish between the 2 interfaces at runtime.
 * - `toSchema`: A factory that is used to create the final mongoose type (which always is `SchemaTypeOpts`)
 *
 * For example, a mongoose Map type of dates (`Map<Date>`) is defined as follows:
 *
 * ```
 * {
 *   type: mongoose.Schema.Types.Map,
 *   of: mongoose.schemaType: Schema.Types.Date,
 * }
 * ```
 *
 * This is dynamic so we need the `toSchema` factory, which accepts both type and internal type (`of`)
 */
export type ResolveType<T extends Schema<any> | GtSchemaTypeMetadataArgs = null> =
  T extends null
    ? { tsType: Ctor<any>; type?: Schema<any> | GtSchemaTypeMetadataArgs }
    : { tsType: Ctor<any>; type?: T; }
  ;

/**
 * Represent the resolved types after analyzing the column metadata providing and the reflected type (from TS).
 *
 * A resolved type (`ResolveType`) represents a match between a runtime type (TS reflection) and a mongoose type.
 *
 * The `reflectedType` options represents the resolution of the type acquired from TS reflection (decorators) and
 * the `userType` represents a custom type defined by the user.
 *
 * In most case there is no use for the `userType`, it is only needed when a collection is used (Map, Array, etc...) or when
 * the user explicitly sets a type.
 *
 * Due to TS limitations, whenever an Array or Map are used, the type that they wrap is unknown which requires the user to explicitly set it.
 * Additionally, due to certain issues with references on startup, the user might set the type through a getter function.
 */
export interface ResolvedColumnType {
  /**
   * The final schema to be used in mongoose.
   */
  schema: SchemaTypeOpts<any>;
  /**
   * The actual runtime type for this column.
   * This will be the user provided runtime type, if provided.
   * If no user runtime type provided it will be the reflected type.
   * Note that for container, this will always be the user provided type.
   */
  underlyingType: Ctor<any>;

  /**
   * True when the reflected type is a known container (Map, Array, etc...)
   * When the reflected type is a container the `userType` is guaranteed to exist since
   * it holds the type contained by the container.
   *
   * Note that the `userType` might also exist for non-container items, if the user explicitly defined it.
   */
  isContainer: boolean;
  reflectedType: ResolveType;
  userType?: Partial<ResolveType>;
}
