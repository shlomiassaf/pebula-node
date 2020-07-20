export type GtIndexSortOrder = 'asc' | 'desc';

export interface GtIndexOptions {
    /** Declares a sparse index. */
    sparse?: boolean | any;

    /** Declares a full text index. */
    text?: boolean | any;

    /** Declares an unique index. */
    unique?: boolean | any;

    /**
     * Wether to run the indexing process in the background or not
     * @default true
     */
    background?: boolean;
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
