export type GtIndexSortOrder = 'asc' | 'desc';

export interface GtIndexOptions {
    /** Declares a sparse index. */
    sparse?: boolean | any;

    /** Declares a full text index. */
    text?: boolean | any;

    /** Declares an unique index. */
    unique?: boolean | any;
}

export interface GtSingleIndexMetadataArgs {
  sort: GtIndexSortOrder;
  options?: GtIndexOptions;
}

export interface GtCompoundIndexMetadataArgs {
  indices: {
    [indexName: string]: GtIndexSortOrder;
  };
  options?: GtIndexOptions;
}
