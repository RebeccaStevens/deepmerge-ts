import type { MergeFunctions as MergeIntoFunctions } from "../defaults/into.js";
import type { MergeFunctions } from "../defaults/vanilla.js";

import type { DeepMergeBuiltInMetaData } from "./merging.js";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions<
  in out M,
  MM extends Readonly<Record<PropertyKey, unknown>> = DeepMergeBuiltInMetaData
> = Partial<DeepMergeOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;

/**
 * The options the user can pass to customize deepmergeInto.
 */
export type DeepMergeIntoOptions<
  in out M,
  MM extends Readonly<Record<PropertyKey, unknown>> = DeepMergeBuiltInMetaData
> = Partial<DeepMergeIntoOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;

type MetaDataUpdater<in out M, MM extends DeepMergeBuiltInMetaData> = (
  previousMeta: M | undefined,
  metaMeta: Readonly<Partial<MM>>
) => M;

/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull<
  in out M,
  MM extends DeepMergeBuiltInMetaData
> = Readonly<{
  mergeRecords: DeepMergeMergeFunctions<M, MM>["mergeRecords"] | false;
  mergeArrays: DeepMergeMergeFunctions<M, MM>["mergeArrays"] | false;
  mergeMaps: DeepMergeMergeFunctions<M, MM>["mergeMaps"] | false;
  mergeSets: DeepMergeMergeFunctions<M, MM>["mergeSets"] | false;
  mergeOthers: DeepMergeMergeFunctions<M, MM>["mergeOthers"];
  metaDataUpdater: MetaDataUpdater<M, MM>;
  enableImplicitDefaultMerging: boolean;
}>;

/**
 * All the options the user can pass to customize deepmergeInto.
 */
type DeepMergeIntoOptionsFull<
  in out M,
  MM extends DeepMergeBuiltInMetaData
> = Readonly<{
  mergeRecords: DeepMergeMergeIntoFunctions<M, MM>["mergeRecords"] | false;
  mergeArrays: DeepMergeMergeIntoFunctions<M, MM>["mergeArrays"] | false;
  mergeMaps: DeepMergeMergeIntoFunctions<M, MM>["mergeMaps"] | false;
  mergeSets: DeepMergeMergeIntoFunctions<M, MM>["mergeSets"] | false;
  mergeOthers: DeepMergeMergeIntoFunctions<M, MM>["mergeOthers"];
  metaDataUpdater: MetaDataUpdater<M, MM>;
}>;

/**
 * An object that has a reference to a value.
 */
export type Reference<T> = {
  value: T;
};

/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeMergeFunctions<
  in M,
  MM extends DeepMergeBuiltInMetaData
> = Readonly<{
  mergeRecords: <
    Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;

  mergeArrays: <
    Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;

  mergeMaps: <
    Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;

  mergeSets: <
    Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;

  mergeOthers: <
    Ts extends ReadonlyArray<unknown>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;
}>;

// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
type DeepMergeMergeIntoFunctionsReturnType = void | symbol;

/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeMergeIntoFunctions<
  in M,
  MM extends DeepMergeBuiltInMetaData
> = Readonly<{
  mergeRecords: <
    Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>
  >(
    m_target: Reference<Record<PropertyKey, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => DeepMergeMergeIntoFunctionsReturnType;

  mergeArrays: <
    Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>
  >(
    m_target: Reference<unknown[]>,
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => DeepMergeMergeIntoFunctionsReturnType;

  mergeMaps: <
    Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>
  >(
    m_target: Reference<Map<unknown, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => DeepMergeMergeIntoFunctionsReturnType;

  mergeSets: <
    Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>
  >(
    m_target: Reference<Set<unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => DeepMergeMergeIntoFunctionsReturnType;

  mergeOthers: <
    Ts extends ReadonlyArray<unknown>,
    U extends DeepMergeMergeIntoFunctionUtils<M, MM>
  >(
    m_target: Reference<unknown>,
    values: Ts,
    utils: U,
    meta: M | undefined
  ) => DeepMergeMergeIntoFunctionsReturnType;
}>;

/**
 * The utils provided to the merge functions.
 */
// eslint-disable-next-line functional/no-mixed-types
export type DeepMergeMergeFunctionUtils<
  in out M,
  MM extends DeepMergeBuiltInMetaData
> = Readonly<{
  mergeFunctions: DeepMergeMergeFunctions<M, MM>;
  defaultMergeFunctions: MergeFunctions;
  metaDataUpdater: MetaDataUpdater<M, MM>;
  deepmerge: <Ts extends ReadonlyArray<unknown>>(...values: Ts) => unknown;
  useImplicitDefaultMerging: boolean;
  actions: Readonly<{
    defaultMerge: symbol;
    skip: symbol;
  }>;
}>;

/**
 * The utils provided to the merge functions.
 */
// eslint-disable-next-line functional/no-mixed-types
export type DeepMergeMergeIntoFunctionUtils<
  in out M,
  MM extends DeepMergeBuiltInMetaData
> = Readonly<{
  mergeFunctions: DeepMergeMergeIntoFunctions<M, MM>;
  defaultMergeFunctions: MergeIntoFunctions;
  metaDataUpdater: MetaDataUpdater<M, MM>;
  deepmergeInto: <Target extends object, Ts extends ReadonlyArray<unknown>>(
    target: Target,
    ...values: Ts
  ) => void;
  actions: Readonly<{
    defaultMerge: symbol;
  }>;
}>;
