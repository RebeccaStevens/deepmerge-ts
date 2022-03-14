// eslint-disable-next-line import/no-relative-parent-imports -- use "@/deepmerge" once denoify can support it.
import type { DeepMergeMergeFunctionsDefaults } from "../index.ts";

import type { DeepMergeBuiltInMetaData } from "./merging.ts";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions<
  M,
  MM extends Readonly<Record<PropertyKey, unknown>> = DeepMergeBuiltInMetaData
> = Partial<DeepMergeOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;

type MetaDataUpdater<M, MM extends DeepMergeBuiltInMetaData> = (
  previousMeta: M | undefined,
  metaMeta: Readonly<Partial<MM>>
) => M;

/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull<M, MM extends DeepMergeBuiltInMetaData> = Readonly<{
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
  M,
  MM extends DeepMergeBuiltInMetaData
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
