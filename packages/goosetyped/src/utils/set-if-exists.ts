
export function setIfExists<Z, T extends keyof Z>(key: T, source: Z, target: Partial<Record<T, Z[T]>>, defaultFallback?: Z[T]): boolean {
  if (key in source) {
    target[key] = source[key];
    return true;
  }
  if (defaultFallback !== undefined) {
    target[key] = defaultFallback;
  }
  return false;
}

export interface BulkSetIfExists<TSource, TTarget> {
  set<T extends (keyof TSource & keyof TTarget)>(key: TSource[T] extends TTarget[T] ? T : never,
                                                 defaultFallback?: TSource[T]): BulkSetIfExists<Omit<TSource, T>, Omit<TTarget, T>>;
}

export function bulkSetIfExists<TSource, TTarget>(source: TSource, target: TTarget): BulkSetIfExists<TSource, TTarget> {
  const obj: BulkSetIfExists<TSource, TTarget> = {
    set<T extends (keyof TSource & keyof TTarget)>(key: TSource[T] extends TTarget[T] ? T : never,
                                                   defaultFallback?: TSource[T]): BulkSetIfExists<Omit<TSource, T>, Omit<TTarget, T>> {
      setIfExists(key, source, target, defaultFallback);
      return obj;
    },
  };
  return obj;
}
