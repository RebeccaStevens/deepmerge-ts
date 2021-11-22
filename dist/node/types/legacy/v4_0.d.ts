/**
 * @file
 *
 * These types are a more simplified version of this library's types
 * designed to work with versions of TypeScript < 4.1
 */

/**
 * All the options the user can pass to customize deepmerge.
 */
declare type DeepMergeOptionsFull = Readonly<{
  mergeRecords: DeepMergeMergeFunctions["mergeRecords"] | false;
  mergeArrays: DeepMergeMergeFunctions["mergeArrays"] | false;
  mergeMaps: DeepMergeMergeFunctions["mergeMaps"] | false;
  mergeSets: DeepMergeMergeFunctions["mergeSets"] | false;
  mergeOthers: DeepMergeMergeFunctions["mergeOthers"];
}>;

/**
 * All the merge functions that deepmerge uses.
 */
declare type DeepMergeMergeFunctions = Readonly<{
  mergeRecords: <Ts extends Readonly<ReadonlyArray<Readonly<Record<keyof any, any>>>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => any;
  mergeArrays: <Ts extends Readonly<ReadonlyArray<Readonly<ReadonlyArray<any>>>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => any;
  mergeMaps: <Ts extends Readonly<ReadonlyArray<Readonly<ReadonlyMap<any, any>>>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => any;
  mergeSets: <Ts extends Readonly<ReadonlyArray<Readonly<ReadonlySet<any>>>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => any;
  mergeOthers: <Ts extends Readonly<ReadonlyArray<any>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => any;
}>;

/**
 * The utils provided to the merge functions.
 */
declare type DeepMergeMergeFunctionUtils = Readonly<{
  mergeFunctions: DeepMergeMergeFunctions;
  defaultMergeFunctions: DeepMergeMergeFunctionsDefaults;
  deepmerge: <Ts extends Readonly<ReadonlyArray<any>>>(...values: Ts) => any;
}>;

/**
 * The default merge functions.
 */
declare type DeepMergeMergeFunctionsDefaults = Readonly<{
  mergeMaps: (values: Record<keyof any, any>[], utils: DeepMergeMergeFunctionUtils) => any;
  mergeSets: (values: any[][], utils: DeepMergeMergeFunctionUtils) => any;
  mergeArrays: (values: Set<any>[], utils: DeepMergeMergeFunctionUtils) => any;
  mergeRecords: (values: Map<any, any>[], utils: DeepMergeMergeFunctionUtils) => any;
  mergeOthers: (values: any[], utils: DeepMergeMergeFunctionUtils) => any;
}>;

/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
declare function deepmerge(): undefined;
declare function deepmerge<T0>(arg0: T0): T0;
declare function deepmerge<T0, T1>(arg0: T0, arg1: T1): T0 & T1;
declare function deepmerge<T0, T1, T2>(arg0: T0, arg1: T1, arg2: T2): T0 & T1 & T2;
declare function deepmerge<T0, T1, T2, T3>(arg0: T0, arg1: T1, arg2: T2, arg3: T3): T0 & T1 & T2 & T3;
declare function deepmerge<T0, T1, T2, T3, T4>(arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4): T0 & T1 & T2 & T3 & T4;
declare function deepmerge<T0, T1, T2, T3, T4, T5>(arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): T0 & T1 & T2 & T3 & T4 & T5;
declare function deepmerge<T0, T1, T2, T3, T4, T5, T6>(arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6): T0 & T1 & T2 & T3 & T4 & T5 & T6;
declare function deepmerge<T0, T1, T2, T3, T4, T5, T6, T7>(arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7): T0 & T1 & T2 & T3 & T4 & T5 & T6 & T7;
declare function deepmerge<T0, T1, T2, T3, T4, T5, T6, T7, T8>(arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8): T0 & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8;
declare function deepmerge<T0, T1, T2, T3, T4, T5, T6, T7, T8, T9>(arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8, arg9: T9): T0 & T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9;
declare function deepmerge(...args: any[]): any;

/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
declare function deepmergeCustom(options: Partial<DeepMergeOptionsFull>): (...objects: any[]) => any;

export { deepmerge, deepmergeCustom };
