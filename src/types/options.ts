import type { MergeFunctions as MergeIntoFunctions } from "../defaults/into.ts";
import type { MergeFunctions } from "../defaults/vanilla.ts";

import type { DeepMergeBuiltInMetaData, DeepMergeMetaData, DeepMergeMetaMetaData } from "./merging.ts";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MM extends Readonly<Record<PropertyKey, unknown>> = {},
> = Partial<DeepMergeOptionsFull<M, MM & DeepMergeMetaMetaData>>;

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
  MM extends Readonly<Record<PropertyKey, unknown>> = {},
> = Partial<DeepMergeIntoOptionsFull<M, MM & DeepMergeMetaMetaData>>;

/**
 * The options the user can pass to customize deepmergeIntoFastUnsafe.
 */
export type DeepMergeIntoFastUnsafeOptions = Partial<
  Omit<DeepMergeIntoOptionsFull<undefined>, "metaDataUpdater" | "maxDepth" | "mergeCircularReferences">
>;

type MetaDataUpdater<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
> = (previousMeta: M | undefined, metaMeta: Readonly<Partial<MM>>) => M;

/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull<
  in out M extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
> = Readonly<{
  mergeRecords: DeepMergeFunctions<M, MM>["mergeRecords"] | false;
  mergeArrays: DeepMergeFunctions<M, MM>["mergeArrays"] | false;
  mergeMaps: DeepMergeFunctions<M, MM>["mergeMaps"] | false;
  mergeSets: DeepMergeFunctions<M, MM>["mergeSets"] | false;
  mergeCircularReferences: DeepMergeFunctions<M, MM>["mergeCircularReferences"] | false;
  mergeOthers: DeepMergeFunctions<M, MM>["mergeOthers"];
  metaDataUpdater: MetaDataUpdater<M, MM>;
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
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
> = Readonly<{
  mergeRecords: DeepMergeIntoFunctions<M, MM>["mergeRecords"] | false;
  mergeArrays: DeepMergeIntoFunctions<M, MM>["mergeArrays"] | false;
  mergeMaps: DeepMergeIntoFunctions<M, MM>["mergeMaps"] | false;
  mergeSets: DeepMergeIntoFunctions<M, MM>["mergeSets"] | false;
  mergeCircularReferences: DeepMergeIntoFunctions<M, MM>["mergeCircularReferences"] | false;
  mergeOthers: DeepMergeIntoFunctions<M, MM>["mergeOthers"];
  metaDataUpdater: MetaDataUpdater<M, MM>;
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
 * An object that has a reference to a value.
 */
export type Reference<T> = {
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
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
> = Readonly<{
  mergeRecords: <Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, U extends DeepMergeUtils<M, MM>>(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeArrays: <Ts extends ReadonlyArray<ReadonlyArray<unknown>>, U extends DeepMergeUtils<M, MM>>(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeUtils<M, MM>>(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeSets: <Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>, U extends DeepMergeUtils<M, MM>>(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeCircularReferences: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeUtils<M, MM>>(
    values: Ts,
    cyclicDepths: ReadonlyArray<number>,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeOthers: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeUtils<M, MM>>(
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
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
> = Readonly<{
  mergeRecords: <Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, U extends DeepMergeIntoUtils<M, MM>>(
    mut_target: Reference<Record<PropertyKey, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeArrays: <Ts extends ReadonlyArray<ReadonlyArray<unknown>>, U extends DeepMergeIntoUtils<M, MM>>(
    mut_target: Reference<unknown[]>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeIntoUtils<M, MM>>(
    mut_target: Reference<Map<unknown, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeSets: <Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>, U extends DeepMergeIntoUtils<M, MM>>(
    mut_target: Reference<Set<unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeCircularReferences: <Ts extends ReadonlyArray<object>, U extends DeepMergeIntoUtils<M, MM>>(
    mut_target: Reference<unknown>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeIntoFunctionsReturnType;

  mergeOthers: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeIntoUtils<M, MM>>(
    mut_target: Reference<unknown>,
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
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
> = Readonly<{
  mergeFunctions: DeepMergeFunctions<M, MM>;
  defaultMergeFunctions: MergeFunctions<M, MM>;
  metaDataUpdater: MetaDataUpdater<M, MM>;
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
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
> = Readonly<{
  mergeFunctions: DeepMergeIntoFunctions<M, MM>;
  defaultMergeFunctions: MergeIntoFunctions<M, MM>;
  metaDataUpdater: MetaDataUpdater<M, MM>;
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
