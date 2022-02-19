import type { DeepMergeMergeFunctionsDefaults } from "@/deepmerge DENOIFY: DEPENDENCY UNMET (BUILTIN)";

import type { DeepMergeBuiltInMetaData } from "./merging.ts";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions<
  M,
  MM extends Record<PropertyKey, unknown> = DeepMergeBuiltInMetaData
> = Partial<DeepMergeOptionsFull<M, MM & Partial<DeepMergeBuiltInMetaData>>>;

type MetaDataUpdater<M, MM extends Record<PropertyKey, unknown>> = (
  previousMeta: M | undefined,
  metaMeta: MM
) => M;

/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull<
  M,
  MM extends Record<PropertyKey, unknown>
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
  MM extends Record<PropertyKey, unknown>
> = Readonly<{
  mergeRecords: <
    Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;

  mergeArrays: <
    Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;

  mergeMaps: <
    Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;

  mergeSets: <
    Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;

  mergeOthers: <
    Ts extends ReadonlyArray<unknown>,
    U extends DeepMergeMergeFunctionUtils<M, MM>
  >(
    records: Ts,
    utils: U,
    meta: M | undefined
  ) => unknown;
}>;

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeMergeFunctionUtils<
  M,
  MM extends Record<PropertyKey, unknown>
> = Readonly<{
  mergeFunctions: DeepMergeMergeFunctions<M, MM>;
  defaultMergeFunctions: DeepMergeMergeFunctionsDefaults;
  metaDataUpdater: MetaDataUpdater<M, MM>;
  deepmerge: <Ts extends ReadonlyArray<unknown>>(...values: Ts) => unknown;
}>;
