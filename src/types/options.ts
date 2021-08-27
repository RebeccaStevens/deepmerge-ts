import type { DeepMergeMergeFunctionsDefaults } from "../deepmerge";

import type { RecordProperty } from "./basics";

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions = Partial<DeepMergeOptionsFull>;

/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull = DeepMergeMergeFunctions;

/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeMergeFunctions = Readonly<{
  mergeRecords: <
    T1 extends Readonly<Record<RecordProperty, unknown>>,
    T2 extends Readonly<Record<RecordProperty, unknown>>,
    U extends DeepMergeMergeFunctionUtils
  >(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;

  mergeArrays: <
    T1 extends Readonly<ReadonlyArray<unknown>>,
    T2 extends Readonly<ReadonlyArray<unknown>>,
    U extends DeepMergeMergeFunctionUtils
  >(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;

  mergeMaps: <
    T1 extends Readonly<ReadonlyMap<unknown, unknown>>,
    T2 extends Readonly<ReadonlyMap<unknown, unknown>>,
    U extends DeepMergeMergeFunctionUtils
  >(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;

  mergeSets: <
    T1 extends Readonly<ReadonlySet<unknown>>,
    T2 extends Readonly<ReadonlySet<unknown>>,
    U extends DeepMergeMergeFunctionUtils
  >(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;

  mergeOthers: <T1, T2, U extends DeepMergeMergeFunctionUtils>(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;
}>;

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeMergeFunctionUtils = Readonly<{
  mergeFunctions: DeepMergeMergeFunctions;
  defaultMergeFunctions: DeepMergeMergeFunctionsDefaults;
  deepmerge: <T1, T2>(x: T1, y: T2) => unknown;
}>;
