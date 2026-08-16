import type { MergeFunctions as MergeIntoFunctions } from "../defaults/into.ts";
import type { MergeFunctions } from "../defaults/vanilla.ts";

import type { DeepMergeBuiltInMetaData, DeepMergeMergeInfo, DeepMergeMetaData } from "./merging.ts";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MI extends Readonly<Record<PropertyKey, unknown>> = {},
> = Partial<DeepMergeOptionsFull<M, MI & DeepMergeMergeInfo>>;

/**
 * The options the user can pass to customize deepmergeFastUnsafe.
 */
export type DeepMergeFastUnsafeOptions = Partial<
  Omit<DeepMergeOptionsFull<undefined>, "metaDataUpdater" | "maxDepth" | "mergeCircularReferences">
>;

/**
 * The options the user can pass to customize deepmergeInto.
 */
export type DeepMergeIntoOptions<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MI extends Readonly<Record<PropertyKey, unknown>> = {},
> = Partial<DeepMergeIntoOptionsFull<M, MI & DeepMergeMergeInfo>>;

/**
 * The options the user can pass to customize deepmergeIntoFastUnsafe.
 */
export type DeepMergeIntoFastUnsafeOptions = Partial<
  Omit<DeepMergeIntoOptionsFull<undefined>, "metaDataUpdater" | "maxDepth" | "mergeCircularReferences">
>;

/**
 * The function used to update the meta data for a merge.
 *
 * Receives the previous meta data and a fresh {@link DeepMergeMergeInfo}
 * describing the current merge step (its `key`, `parents`, `values`, and
 * `result`). Return the next meta value to pass down the merge tree.
 *
 * @param previousMeta - The previous meta data.
 * @param mergeInfo - The meta data about the current merge operation.
 * @example
 * ```ts
 * import { deepmergeCustom } from "deepmerge-ts";
 *
 * // Track the path of keys being merged.
 * const merge = deepmergeCustom({
 *   metaDataUpdater: (previousMeta, mergeInfo) => ({
 *     path: [...(previousMeta?.path ?? []), mergeInfo.key],
 *   }),
 * });
 * ```
 */
export type MetaDataUpdater<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
> = (previousMeta: M | undefined, mergeInfo: Readonly<Partial<MI>>) => M;

/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
> = Readonly<{
  mergeRecords: DeepMergeFunctions<M, MI>["mergeRecords"] | false;
  mergeArrays: DeepMergeFunctions<M, MI>["mergeArrays"] | false;
  mergeMaps: DeepMergeFunctions<M, MI>["mergeMaps"] | false;
  mergeSets: DeepMergeFunctions<M, MI>["mergeSets"] | false;
  mergeCircularReferences: DeepMergeFunctions<M, MI>["mergeCircularReferences"] | false;
  mergeOthers: DeepMergeFunctions<M, MI>["mergeOthers"];
  metaDataUpdater: MetaDataUpdater<M, MI>;
  enableImplicitDefaultMerging: boolean;
  filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | false;

  /**
   * The maximum depth to merge to. When reached, further nested objects will not be deeply merged.
   * Useful for preventing stack exhaustion when merging untrusted input.
   *
   * @default 1000
   */
  maxDepth: number;
}>;

/**
 * All the options the user can pass to customize deepmergeInto.
 */
type DeepMergeIntoOptionsFull<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
> = Readonly<{
  mergeRecords: DeepMergeIntoFunctions<M, MI>["mergeRecords"] | false;
  mergeArrays: DeepMergeIntoFunctions<M, MI>["mergeArrays"] | false;
  mergeMaps: DeepMergeIntoFunctions<M, MI>["mergeMaps"] | false;
  mergeSets: DeepMergeIntoFunctions<M, MI>["mergeSets"] | false;
  mergeCircularReferences: DeepMergeIntoFunctions<M, MI>["mergeCircularReferences"] | false;
  mergeOthers: DeepMergeIntoFunctions<M, MI>["mergeOthers"];
  metaDataUpdater: MetaDataUpdater<M, MI>;
  filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | false;

  /**
   * The maximum depth to merge to. When reached, further nested objects will not be deeply merged.
   * Useful for preventing stack exhaustion when merging untrusted input.
   *
   * @default 1000
   */
  maxDepth: number;
}>;

/**
 * An object that has a reference to a value being merged into.
 */
export type DeepMergeValueReference<T> = {
  value: T;
};

/**
 * All the utility functions that can be overridden.
 */
type DeepMergeUtilityFunctions<in M extends DeepMergeMetaData = DeepMergeBuiltInMetaData> = Readonly<{
  filterValues: <Ts extends ReadonlyArray<unknown>>(values: Ts, meta: M | undefined) => ReadonlyArray<unknown>;
}>;

/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeFunctions<
  in M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
> = Readonly<{
  mergeRecords: <Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, U extends DeepMergeUtils<M, MI>>(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeArrays: <Ts extends ReadonlyArray<ReadonlyArray<unknown>>, U extends DeepMergeUtils<M, MI>>(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeUtils<M, MI>>(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeSets: <Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>, U extends DeepMergeUtils<M, MI>>(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeCircularReferences: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeUtils<M, MI>>(
    values: Ts,
    cyclicDepths: ReadonlyArray<number>,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeOthers: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeUtils<M, MI>>(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;
}>;

// eslint-disable-next-line ts/no-invalid-void-type
type DeepMergeIntoFunctionsReturnType = void | symbol;

/**
 * All the merge functions that deepmergeInto uses.
 */
type DeepMergeIntoFunctions<
  in M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
> = Readonly<{
  mergeRecords: <Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, U extends DeepMergeIntoUtils<M, MI>>(
    mut_target: DeepMergeValueReference<Record<PropertyKey, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeArrays: <Ts extends ReadonlyArray<ReadonlyArray<unknown>>, U extends DeepMergeIntoUtils<M, MI>>(
    mut_target: DeepMergeValueReference<unknown[]>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeIntoUtils<M, MI>>(
    mut_target: DeepMergeValueReference<Map<unknown, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeSets: <Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>, U extends DeepMergeIntoUtils<M, MI>>(
    mut_target: DeepMergeValueReference<Set<unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeCircularReferences: <Ts extends ReadonlyArray<object>, U extends DeepMergeIntoUtils<M, MI>>(
    mut_target: DeepMergeValueReference<unknown>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeOthers: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeIntoUtils<M, MI>>(
    mut_target: DeepMergeValueReference<unknown>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;
}>;

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeUtils<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
> = Readonly<{
  mergeFunctions: DeepMergeFunctions<M, MI>;
  defaultMergeFunctions: MergeFunctions<M, MI>;
  metaDataUpdater: MetaDataUpdater<M, MI>;
  deepmerge: <Ts extends ReadonlyArray<unknown>>(...values: Ts) => unknown;
  useImplicitDefaultMerging: boolean;
  filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | undefined;
  maxDepth: number | undefined;
  actions: Readonly<{
    defaultMerge: symbol;
    skip: symbol;
  }>;
}>;

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeIntoUtils<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
> = Readonly<{
  mergeFunctions: DeepMergeIntoFunctions<M, MI>;
  defaultMergeFunctions: MergeIntoFunctions<M, MI>;
  metaDataUpdater: MetaDataUpdater<M, MI>;
  deepmergeInto: <Target extends object, Ts extends ReadonlyArray<unknown>>(target: Target, ...values: Ts) => void;
  filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | undefined;
  maxDepth: number | undefined;
  actions: Readonly<{
    defaultMerge: symbol;
  }>;
}>;

/**
 * The utils provided to the merge functions in fast mode.
 */
export type DeepMergeFastUnsafeUtils = DeepMergeUtils<undefined>;

/**
 * The utils provided to the into merge functions in fast mode.
 */
export type DeepMergeIntoFastUnsafeUtils = DeepMergeIntoUtils<undefined>;
