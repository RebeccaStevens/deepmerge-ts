import type { DeepMergeMergeFunctionsDefaults } from "@/deepmerge";

import type { DeepMergeBuiltInMetaData } from "./merging";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions<
  M,
  MM extends Partial<DeepMergeBuiltInMetaData> = DeepMergeBuiltInMetaData
> = Partial<DeepMergeOptionsFull<M, MM>>;

type MetaDataUpdater<M, MM extends Partial<DeepMergeBuiltInMetaData>> = (
  previousMeta: M,
  metaMeta: MM
) => M;

/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull<
  M,
  MM extends Partial<DeepMergeBuiltInMetaData>
> = Readonly<{
  mergeRecords: DeepMergeMergeFunctions<M, MM>["mergeRecords"] | false;
  mergeArrays: DeepMergeMergeFunctions<M, MM>["mergeArrays"] | false;
  mergeMaps: DeepMergeMergeFunctions<M, MM>["mergeMaps"] | false;
  mergeSets: DeepMergeMergeFunctions<M, MM>["mergeSets"] | false;
  mergeOthers: DeepMergeMergeFunctions<M, MM>["mergeOthers"];
  metaDataUpdater: MetaDataUpdater<M, MM>;
}>;

/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeMergeFunctions<
  M,
  MM extends Partial<DeepMergeBuiltInMetaData>
> = Readonly<{
  mergeRecords: <
    Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M
  ) => unknown;

  mergeArrays: <
    Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M
  ) => unknown;

  mergeMaps: <
    Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M
  ) => unknown;

  mergeSets: <
    Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M
  ) => unknown;

  mergeOthers: <
    Ts extends ReadonlyArray<unknown>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M
  ) => unknown;
}>;

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeMergeFunctionUtils<
  M,
  MM extends Partial<DeepMergeBuiltInMetaData>
> = Readonly<{
  mergeFunctions: DeepMergeMergeFunctions<M, MM>;
  defaultMergeFunctions: DeepMergeMergeFunctionsDefaults;
  metaDataUpdater: MetaDataUpdater<M, MM>;
  deepmerge: <Ts extends ReadonlyArray<unknown>>(...values: Ts) => unknown;
}>;
