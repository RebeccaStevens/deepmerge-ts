import { D as DeepMergeBuiltInMetaData, a as DeepMergeHKT, b as DeepMergeMergeFunctionsDefaultURIs, c as DeepMergeMergeFunctionsURIs, G as GetDeepMergeMergeFunctionsURIs, d as DeepMergeRecordsDefaultHKT, e as DeepMergeArraysDefaultHKT, f as DeepMergeSetsDefaultHKT, g as DeepMergeMapsDefaultHKT } from './common.js';
export { e as DeepMergeArraysDefaultHKT, D as DeepMergeBuiltInMetaData, a as DeepMergeHKT, h as DeepMergeLeaf, i as DeepMergeLeafHKT, j as DeepMergeLeafURI, g as DeepMergeMapsDefaultHKT, k as DeepMergeMergeFunctionURItoKind, b as DeepMergeMergeFunctionsDefaultURIs, c as DeepMergeMergeFunctionsURIs, d as DeepMergeRecordsDefaultHKT, f as DeepMergeSetsDefaultHKT } from './common.js';

/**
 * The options the user can pass to customize deepmerge.
 */
declare type DeepMergeOptions<M, MM extends Readonly<Record<PropertyKey, unknown>> = DeepMergeBuiltInMetaData> = Partial<DeepMergeOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;
declare type MetaDataUpdater<M, MM extends DeepMergeBuiltInMetaData> = (previousMeta: M | undefined, metaMeta: Readonly<Partial<MM>>) => M;
/**
 * All the options the user can pass to customize deepmerge.
 */
declare type DeepMergeOptionsFull<M, MM extends DeepMergeBuiltInMetaData> = Readonly<{
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
declare type DeepMergeMergeFunctions<M, MM extends DeepMergeBuiltInMetaData> = Readonly<{
    mergeRecords: <Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
    mergeArrays: <Ts extends ReadonlyArray<ReadonlyArray<unknown>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
    mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
    mergeSets: <Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
    mergeOthers: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeMergeFunctionUtils<M, MM>>(records: Ts, utils: U, meta: M | undefined) => unknown;
}>;
/**
 * The utils provided to the merge functions.
 */
declare type DeepMergeMergeFunctionUtils<M, MM extends DeepMergeBuiltInMetaData> = Readonly<{
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

declare const defaultMergeFunctions: {
    readonly mergeMaps: typeof defaultMergeMaps;
    readonly mergeSets: typeof defaultMergeSets;
    readonly mergeArrays: typeof defaultMergeArrays;
    readonly mergeRecords: typeof defaultMergeRecords;
    readonly mergeOthers: typeof leaf;
};
/**
 * The default merge functions.
 */
declare type DeepMergeMergeFunctionsDefaults = typeof defaultMergeFunctions;
/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
declare function deepmerge<Ts extends Readonly<ReadonlyArray<unknown>>>(...objects: readonly [...Ts]): DeepMergeHKT<Ts, DeepMergeMergeFunctionsDefaultURIs, DeepMergeBuiltInMetaData>;
/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
declare function deepmergeCustom<PMF extends Partial<DeepMergeMergeFunctionsURIs>>(options: DeepMergeOptions<DeepMergeBuiltInMetaData, DeepMergeBuiltInMetaData>): <Ts extends ReadonlyArray<unknown>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>, DeepMergeBuiltInMetaData>;
/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items' being merged.
 */
declare function deepmergeCustom<PMF extends Partial<DeepMergeMergeFunctionsURIs>, MetaData, MetaMetaData extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData>(options: DeepMergeOptions<MetaData, MetaMetaData>, rootMetaData?: MetaData): <Ts extends ReadonlyArray<unknown>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>, MetaData>;
/**
 * The default strategy to merge records.
 *
 * @param values - The records.
 */
declare function defaultMergeRecords<Ts extends ReadonlyArray<Record<PropertyKey, unknown>>, U extends DeepMergeMergeFunctionUtils<M, MM>, MF extends DeepMergeMergeFunctionsURIs, M, MM extends DeepMergeBuiltInMetaData>(values: Ts, utils: U, meta: M | undefined): DeepMergeRecordsDefaultHKT<Ts, MF, M>;
/**
 * The default strategy to merge arrays.
 *
 * @param values - The arrays.
 */
declare function defaultMergeArrays<Ts extends ReadonlyArray<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs, M>(values: Ts): DeepMergeArraysDefaultHKT<Ts, MF, M>;
/**
 * The default strategy to merge sets.
 *
 * @param values - The sets.
 */
declare function defaultMergeSets<Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>>(values: Ts): DeepMergeSetsDefaultHKT<Ts>;
/**
 * The default strategy to merge maps.
 *
 * @param values - The maps.
 */
declare function defaultMergeMaps<Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>>(values: Ts): DeepMergeMapsDefaultHKT<Ts>;
/**
 * Get the last value in the given array.
 */
declare function leaf<Ts extends ReadonlyArray<unknown>>(values: Ts): unknown;

export { DeepMergeMergeFunctionUtils, DeepMergeMergeFunctionsDefaults, DeepMergeOptions, deepmerge, deepmergeCustom };
