// eslint-disable-next-line import/no-relative-parent-imports -- use "deepmerge-ts" once denoify can support it.
import type { DeepMergeMergeFunctionsDefaults } from "../index.js";

import type { DeepMergeBuiltInMetaData } from "./merging.js";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions<
  in out M,
  MM extends Readonly<Record<PropertyKey, unknown>> = DeepMergeBuiltInMetaData
> = Partial<DeepMergeOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;

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

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeMergeFunctionUtils<
  in out M,
  MM extends DeepMergeBuiltInMetaData
> = Readonly<{
  mergeFunctions: DeepMergeMergeFunctions<M, MM>;
  defaultMergeFunctions: DeepMergeMergeFunctionsDefaults;
  metaDataUpdater: MetaDataUpdater<M, MM>;
  deepmerge: <Ts extends ReadonlyArray<unknown>>(...values: Ts) => unknown;
  useImplicitDefaultMerging: boolean;
  actions: Readonly<{
    defaultMerge: symbol;
    skip: symbol;
  }>;
}>;
