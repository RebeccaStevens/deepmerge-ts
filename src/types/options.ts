import type { DeepMergeMergeFunctionsDefaults } from "@/deepmerge";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions = Partial<DeepMergeOptionsFull>;

/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull = Readonly<{
  mergeRecords: DeepMergeMergeFunctions["mergeRecords"] | false;
  mergeArrays: DeepMergeMergeFunctions["mergeArrays"] | false;
  mergeMaps: DeepMergeMergeFunctions["mergeMaps"] | false;
  mergeSets: DeepMergeMergeFunctions["mergeSets"] | false;
  mergeOthers: DeepMergeMergeFunctions["mergeOthers"];
}>;

/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeMergeFunctions = Readonly<{
  mergeRecords: <
    Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
    U extends DeepMergeMergeFunctionUtils
  >(
    records: Ts,
    utils: U
  ) => unknown;

  mergeArrays: <
    Ts extends ReadonlyArray<Readonly<ReadonlyArray<unknown>>>,
    U extends DeepMergeMergeFunctionUtils
  >(
    records: Ts,
    utils: U
  ) => unknown;

  mergeMaps: <
    Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
    U extends DeepMergeMergeFunctionUtils
  >(
    records: Ts,
    utils: U
  ) => unknown;

  mergeSets: <
    Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
    U extends DeepMergeMergeFunctionUtils
  >(
    records: Ts,
    utils: U
  ) => unknown;

  mergeOthers: <
    Ts extends ReadonlyArray<unknown>,
    U extends DeepMergeMergeFunctionUtils
  >(
    records: Ts,
    utils: U
  ) => unknown;
}>;

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeMergeFunctionUtils = Readonly<{
  mergeFunctions: DeepMergeMergeFunctions;
  defaultMergeFunctions: DeepMergeMergeFunctionsDefaults;
  deepmerge: <Ts extends ReadonlyArray<unknown>>(...values: Ts) => unknown;
}>;
