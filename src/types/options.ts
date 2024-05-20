import { type MergeFunctions as MergeIntoFunctions } from "../defaults/into";
import { type MergeFunctions } from "../defaults/vanilla";

import { type DeepMergeBuiltInMetaData } from "./merging";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions<
  in out M,
  MM extends Readonly<Record<PropertyKey, unknown>> = {},
> = Partial<DeepMergeOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;

/**
 * The options the user can pass to customize deepmergeInto.
 */
export type DeepMergeIntoOptions<
  in out M,
  MM extends Readonly<Record<PropertyKey, unknown>> = {},
> = Partial<DeepMergeIntoOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;

type MetaDataUpdater<
  in out M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
> = (previousMeta: M | undefined, metaMeta: Readonly<Partial<MM>>) => M;

/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull<
  in out M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
> = Readonly<{
  mergeRecords: DeepMergeMergeFunctions<M, MM>["mergeRecords"] | false;
  mergeArrays: DeepMergeMergeFunctions<M, MM>["mergeArrays"] | false;
  mergeMaps: DeepMergeMergeFunctions<M, MM>["mergeMaps"] | false;
  mergeSets: DeepMergeMergeFunctions<M, MM>["mergeSets"] | false;
  mergeOthers: DeepMergeMergeFunctions<M, MM>["mergeOthers"];
  metaDataUpdater: MetaDataUpdater<M, MM>;
  enableImplicitDefaultMerging: boolean;
  filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | false;
}>;

/**
 * All the options the user can pass to customize deepmergeInto.
 */
type DeepMergeIntoOptionsFull<
  in out M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
> = Readonly<{
  mergeRecords: DeepMergeMergeIntoFunctions<M, MM>["mergeRecords"] | false;
  mergeArrays: DeepMergeMergeIntoFunctions<M, MM>["mergeArrays"] | false;
  mergeMaps: DeepMergeMergeIntoFunctions<M, MM>["mergeMaps"] | false;
  mergeSets: DeepMergeMergeIntoFunctions<M, MM>["mergeSets"] | false;
  mergeOthers: DeepMergeMergeIntoFunctions<M, MM>["mergeOthers"];
  metaDataUpdater: MetaDataUpdater<M, MM>;
  filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | false;
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
type DeepMergeUtilityFunctions<in M> = Readonly<{
  filterValues: <Ts extends ReadonlyArray<unknown>>(
    values: Ts,
    meta: M | undefined,
  ) => unknown[];
}>;

/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeMergeFunctions<
  in M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
> = Readonly<{
  mergeRecords: <
    Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>,
  >(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeArrays: <
    Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>,
  >(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeMaps: <
    Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>,
  >(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeSets: <
    Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>,
  >(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;

  mergeOthers: <
    Ts extends ReadonlyArray<unknown>,
    U extends DeepMergeMergeFunctionUtils<M, MM>,
  >(
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => unknown;
}>;

// eslint-disable-next-line ts/no-invalid-void-type
type DeepMergeMergeIntoFunctionsReturnType = void | symbol;

/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeMergeIntoFunctions<
  in M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
> = Readonly<{
  mergeRecords: <
    Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>,
  >(
    m_target: Reference<Record<PropertyKey, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeMergeIntoFunctionsReturnType;

  mergeArrays: <
    Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>,
  >(
    m_target: Reference<unknown[]>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeMergeIntoFunctionsReturnType;

  mergeMaps: <
    Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>,
  >(
    m_target: Reference<Map<unknown, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeMergeIntoFunctionsReturnType;

  mergeSets: <
    Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>,
  >(
    m_target: Reference<Set<unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeMergeIntoFunctionsReturnType;

  mergeOthers: <
    Ts extends ReadonlyArray<unknown>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>,
  >(
    m_target: Reference<unknown>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => DeepMergeMergeIntoFunctionsReturnType;
}>;

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeMergeFunctionUtils<
  in out M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
> = Readonly<{
  mergeFunctions: DeepMergeMergeFunctions<M, MM>;
  defaultMergeFunctions: MergeFunctions;
  metaDataUpdater: MetaDataUpdater<M, MM>;
  deepmerge: <Ts extends ReadonlyArray<unknown>>(...values: Ts) => unknown;
  useImplicitDefaultMerging: boolean;
  filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | undefined;
  actions: Readonly<{
    defaultMerge: symbol;
    skip: symbol;
  }>;
}>;

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeMergeIntoFunctionUtils<
  in out M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
> = Readonly<{
  mergeFunctions: DeepMergeMergeIntoFunctions<M, MM>;
  defaultMergeFunctions: MergeIntoFunctions;
  metaDataUpdater: MetaDataUpdater<M, MM>;
  deepmergeInto: <Target extends object, Ts extends ReadonlyArray<unknown>>(
    target: Target,
    ...values: Ts
  ) => void;
  filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | undefined;
  actions: Readonly<{
    defaultMerge: symbol;
  }>;
}>;
