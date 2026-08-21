import { actions } from "../actions.ts";
import type {
  DeepMergeArraysDefaultHKT,
  DeepMergeBuiltInMetaData,
  DeepMergeFunctionsURIs,
  DeepMergeMergeInfo,
  DeepMergeMetaData,
  DeepMergeSetsDefaultHKT,
  DeepMergeUtils,
  DeepMergeValueReference,
  HierarchyValue,
} from "../types/index.ts";

/**
 * Returns an empty container of the same outward type as `value`. Used when
 * `deepmergeInto` recurses through a property the target does not have, so
 * the recursion has a place to write its result without aliasing any source's
 * nested array/set/map.
 *
 * @param value - A representative value (the kind to copy structurally).
 * @returns A fresh `Array` / `Set` / `Map` / `Record` (or `value` itself if it
 * is not one of those types).
 */
export function emptyLike(value: unknown): unknown {
  if (Array.isArray(value)) {
    return [];
  }
  if (value instanceof Set) {
    return new Set();
  }
  if (value instanceof Map) {
    return new Map();
  }
  if (typeof value === "object" && value !== null) {
    return {};
  }
  return value;
}

/**
 * The default function to update meta data.
 *
 * It builds and updates the hierarchy tree.
 *
 * @param previousMeta - The previous meta data.
 * @param mergeInfo - Meta information about the current merge state.
 * @returns The updated meta data.
 */
export function defaultMetaDataUpdater(
  previousMeta: DeepMergeBuiltInMetaData | undefined,
  mergeInfo: DeepMergeMergeInfo,
): DeepMergeBuiltInMetaData {
  const ancestor: HierarchyValue = {
    key: mergeInfo.key,
    parents: mergeInfo.parents,
    values: mergeInfo.values,
    result: mergeInfo.result,
  };
  const prevHierarchy = previousMeta?.hierarchy;
  return {
    ...ancestor,
    hierarchy: prevHierarchy === undefined ? [ancestor] : [...prevHierarchy, ancestor],
  };
}

/**
 * The default function to update meta data in fast mode.
 *
 * It doesn't track any meta data.
 *
 * @param previousMeta - The previous meta data.
 * @param mergeInfo - Meta information about the current merge state.
 * @returns The updated meta data (undefined).
 */
export function defaultMetaDataUpdaterFast(previousMeta: undefined, mergeInfo: DeepMergeMergeInfo): undefined {
  return undefined;
}

/**
 * The default function to filter values.
 *
 * It filters out undefined values.
 *
 * @param values - The values to filter.
 * @param meta - The meta data.
 * @returns The filtered values.
 */
export function defaultFilterValues<Ts extends ReadonlyArray<unknown>, M>(
  values: Ts,
  meta: M | undefined,
): ReadonlyArray<unknown> {
  // Fast path: avoid allocating a new array when no undefined values exist.
  return values.includes(undefined) ? values.filter((value) => value !== undefined) : values;
}

/**
 * Check if the custom merge result should fall back to the default merge function.
 *
 * @param utils - The utils.
 * @param fallback - The name of the fallback merge function.
 * @param result - The result of the custom merge function.
 * @returns Whether to use the default merge function.
 */
export function shouldFallbackToDefault<M extends DeepMergeMetaData, MI extends DeepMergeMergeInfo>(
  utils: DeepMergeUtils<M, MI>,
  fallback: keyof DeepMergeUtils<M, MI>["mergeFunctions"],
  result: unknown,
): boolean {
  return (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions[fallback] !== utils.defaultMergeFunctions[fallback])
  );
}

/**
 * Resolve custom merge functions from user options.
 *
 * @param options - The options passed by the user.
 * @param defaultMergeFunctions - The default merge functions.
 * @returns The resolved merge functions.
 */
export function resolveCustomMergeFunctions<Fns extends { mergeOthers: unknown } & Record<PropertyKey, unknown>>(
  options: Record<PropertyKey, unknown>,
  defaultMergeFunctions: Fns,
): Fns {
  return {
    ...defaultMergeFunctions,
    ...Object.fromEntries(
      Object.entries(options)
        .filter(([key]) => Object.hasOwn(defaultMergeFunctions, key))
        .map(([key, option]) =>
          option === false
            ? [key, defaultMergeFunctions.mergeOthers]
            : typeof option === "function"
              ? [key, option]
              : [key, defaultMergeFunctions[key]],
        ),
    ),
  };
}

/**
 * The default strategy to merge arrays.
 *
 * @param values - The arrays.
 * @param utils - The utils.
 * @param meta - The meta data.
 * @returns The merged array.
 */
export function mergeArrays<
  Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
  U extends DeepMergeUtils<M, MI>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: Ts, utils?: U, meta?: M): DeepMergeArraysDefaultHKT<Ts, Fs, M> {
  return values.flat() as DeepMergeArraysDefaultHKT<Ts, Fs, M>;
}

/**
 * The default strategy to merge sets.
 *
 * @param values - The sets.
 * @param utils - The utils.
 * @param meta - The meta data.
 * @returns The merged set.
 */
export function mergeSets<
  Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
  U extends DeepMergeUtils<M, MI>,
  // eslint-disable-next-line ts/no-unused-vars
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: Ts, utils?: U, meta?: M): DeepMergeSetsDefaultHKT<Ts> {
  const result = new Set<unknown>();
  for (const set of values) {
    for (const element of set) {
      result.add(element);
    }
  }
  return result as DeepMergeSetsDefaultHKT<Ts>;
}

/**
 * The default strategy to merge other things.
 *
 * @param values - The other things.
 * @param utils - The utils.
 * @param meta - The meta data.
 * @returns The merged value.
 */
export function mergeOthers<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeUtils<M, MI>,
  // eslint-disable-next-line ts/no-unused-vars
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: Ts, utils?: U, meta?: M): unknown {
  return values.at(-1);
}

/**
 * The default strategy to merge arrays into a target array.
 *
 * @param mut_target - The target to merge into.
 * @param values - The arrays (including the target's value if there is one).
 */
export function mergeArraysInto<Ts extends ReadonlyArray<ReadonlyArray<unknown>>>(
  mut_target: DeepMergeValueReference<unknown[]>,
  values: Ts,
): void {
  // Build the merged array.
  const result: unknown[] = [];
  for (const value of values) {
    const arr = value;
    for (const element of arr) {
      result.push(element);
    }
  }
  // Mutate the target container in place. At the top level this preserves
  // the user's target reference; in the recursion `mut_target.value` is
  // either the user's target's nested array (so the same in-place semantic
  // applies) or a clone we made ourselves, so the source can never be
  // touched through this assignment.
  const target = mut_target.value;
  target.splice(0, target.length, ...result);
}

/**
 * The default strategy to merge sets into a target set.
 *
 * @param mut_target - The target to merge into.
 * @param values - The sets (including the target's value if there is one).
 */
export function mergeSetsInto<Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>>(
  mut_target: DeepMergeValueReference<Set<unknown>>,
  values: Ts,
): void {
  // Build the merged set.
  const result = new Set<unknown>();
  for (const value_ of values) {
    for (const value of value_) {
      result.add(value);
    }
  }
  // Mutate the target set in place. See `mergeArraysInto` for the rationale
  // about why this is safe at recursion (the recursion only runs against
  // the target's nested container or a clone we made, never a source).
  const target = mut_target.value;
  target.clear();
  for (const value of result) {
    target.add(value);
  }
}

/**
 * The default strategy to merge other things into a target.
 *
 * @param mut_target - The target to merge into.
 * @param values - The other things.
 */
export function mergeOthersInto<Ts extends ReadonlyArray<unknown>>(
  mut_target: DeepMergeValueReference<unknown>,
  values: Ts,
): void {
  // Idempotent for non-containers: assigning the leaf value mutates only
  // the wrapper's `.value` slot (a property on our own object), so this is
  // safe at recursion regardless of where the wrapper originated.
  mut_target.value = values.at(-1);
}
