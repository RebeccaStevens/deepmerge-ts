/**
 * @file
 *
 * These types are a more simplified version of this library's types
 * designed to work with versions of TypeScript < 4.1
 */

declare type MetaDataUpdater<M, MM extends Record<keyof any, any>> = (previousMeta: M | undefined, metaMeta: MM) => M;

/**
 * All the options the user can pass to customize deepmerge.
 */
declare type DeepMergeOptionsFull<M, MM extends Record<keyof any, any>> = Readonly<{
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
declare type DeepMergeMergeFunctions<M, MM extends Record<keyof any, any>> = Readonly<{
  mergeRecords: <Ts extends ReadonlyArray<Readonly<Record<keyof any, any>>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => any;
  mergeArrays: <Ts extends ReadonlyArray<ReadonlyArray<any>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => any;
  mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<any, any>>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => any;
  mergeSets: <Ts extends ReadonlyArray<Readonly<ReadonlySet<any>>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => any;
  mergeOthers: <Ts extends ReadonlyArray<any>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => any;
}>;

/**
 * The utils provided to the merge functions.
 */
declare type DeepMergeMergeFunctionUtils<M, MM extends Record<keyof any, any>> = Readonly<{
  mergeFunctions: DeepMergeMergeFunctions<M, MM>;
  defaultMergeFunctions: DeepMergeMergeFunctionsDefaults<M, MM>;
  metaDataUpdater: MetaDataUpdater<M, MM>;
  deepmerge: <Ts extends ReadonlyArray<any>>(...values: Ts) => any;
}>;

/**
 * The default merge functions.
 */
declare type DeepMergeMergeFunctionsDefaults<M, MM extends Record<keyof any, any>> = Readonly<{
  mergeMaps: (values: Record<keyof any, any>[]) => any;
  mergeSets: (values: any[][]) => any;
  mergeArrays: (values: Set<any>[]) => any;
  mergeRecords: (values: Map<any, any>[], utils: DeepMergeMergeFunctionUtils<M, MM>, meta: M | undefined) => any;
  mergeOthers: (values: any[]) => any;
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
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items' being merged.
 */
declare function deepmergeCustom(options: Partial<DeepMergeOptionsFull<any, any>>, rootMetaData?: any): (...objects: any[]) => any;

export { deepmerge, deepmergeCustom };
