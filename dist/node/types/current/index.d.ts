/**
 * Flatten a complex type such as a union or intersection of objects into a
 * single object.
 */
declare type FlatternAlias<T> = {
    [P in keyof T]: T[P];
} & {};
/**
 * Get the value of the given key in the given object.
 */
declare type ValueOfKey<T extends Record<PropertyKey, unknown>, K extends PropertyKey> = K extends keyof T ? T[K] : never;
/**
 * Safely test whether or not the first given types extends the second.
 *
 * Needed in particular for testing if a type is "never".
 */
declare type Is<T1, T2> = [T1] extends [T2] ? true : false;
/**
 * Safely test whether or not the given type is "never".
 */
declare type IsNever<T> = Is<T, never>;
/**
 * Returns whether or not the given type a record.
 */
declare type IsRecord<T> = And<Not<IsNever<T>>, T extends Readonly<Record<PropertyKey, unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are records.
 */
declare type EveryIsRecord<Ts extends Readonly<ReadonlyArray<unknown>>> = Ts extends Readonly<readonly [infer Head, ...infer Rest]> ? IsRecord<Head> extends true ? Rest extends Readonly<ReadonlyArray<unknown>> ? EveryIsRecord<Rest> : true : false : true;
/**
 * Returns whether or not the given type is an array.
 */
declare type IsArray<T> = And<Not<IsNever<T>>, T extends Readonly<ReadonlyArray<unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are arrays.
 */
declare type EveryIsArray<Ts extends Readonly<ReadonlyArray<unknown>>> = Ts extends Readonly<readonly [infer T1]> ? IsArray<T1> : Ts extends Readonly<readonly [infer Head, ...infer Rest]> ? IsArray<Head> extends true ? Rest extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]> ? EveryIsArray<Rest> : false : false : false;
/**
 * Returns whether or not the given type is an set.
 *
 * Note: This may also return true for Maps.
 */
declare type IsSet<T> = And<Not<IsNever<T>>, T extends Readonly<ReadonlySet<unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are sets.
 *
 * Note: This may also return true if all are maps.
 */
declare type EveryIsSet<Ts extends Readonly<ReadonlyArray<unknown>>> = Ts extends Readonly<readonly [infer T1]> ? IsSet<T1> : Ts extends Readonly<readonly [infer Head, ...infer Rest]> ? IsSet<Head> extends true ? Rest extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]> ? EveryIsSet<Rest> : false : false : false;
/**
 * Returns whether or not the given type is an map.
 */
declare type IsMap<T> = And<Not<IsNever<T>>, T extends Readonly<ReadonlyMap<unknown, unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are maps.
 */
declare type EveryIsMap<Ts extends Readonly<ReadonlyArray<unknown>>> = Ts extends Readonly<readonly [infer T1]> ? IsMap<T1> : Ts extends Readonly<readonly [infer Head, ...infer Rest]> ? IsMap<Head> extends true ? Rest extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]> ? EveryIsMap<Rest> : false : false : false;
/**
 * And operator for types.
 */
declare type And<T1 extends boolean, T2 extends boolean> = T1 extends false ? false : T2;
/**
 * Not operator for types.
 */
declare type Not<T extends boolean> = T extends true ? false : true;
/**
 * Union of the sets' values' types
 */
declare type UnionSetValues<Ts extends Readonly<ReadonlyArray<unknown>>> = UnionSetValuesHelper<Ts, never>;
/**
 * Tail-recursive helper type for UnionSetValues.
 */
declare type UnionSetValuesHelper<Ts extends Readonly<ReadonlyArray<unknown>>, Acc> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Readonly<ReadonlySet<infer V1>> ? Rest extends Readonly<ReadonlyArray<unknown>> ? UnionSetValuesHelper<Rest, Acc | V1> : Acc | V1 : never : Acc;
/**
 * Union of the maps' values' types
 */
declare type UnionMapKeys<Ts extends Readonly<ReadonlyArray<unknown>>> = UnionMapKeysHelper<Ts, never>;
/**
 * Tail-recursive helper type for UnionMapKeys.
 */
declare type UnionMapKeysHelper<Ts extends Readonly<ReadonlyArray<unknown>>, Acc> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Readonly<ReadonlyMap<infer K1, unknown>> ? Rest extends readonly [] ? Acc | K1 : UnionMapKeysHelper<Rest, Acc | K1> : never : Acc;
/**
 * Union of the maps' keys' types
 */
declare type UnionMapValues<Ts extends Readonly<ReadonlyArray<unknown>>> = UnionMapValuesHelper<Ts, never>;
/**
 * Tail-recursive helper type for UnionMapValues.
 */
declare type UnionMapValuesHelper<Ts extends Readonly<ReadonlyArray<unknown>>, Acc> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Readonly<ReadonlyMap<unknown, infer V1>> ? Rest extends readonly [] ? Acc | V1 : UnionMapValuesHelper<Rest, Acc | V1> : never : Acc;
/**
 * Get the keys of the type what match a certain criteria.
 */
declare type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];
/**
 * Get the required keys of the type.
 */
declare type RequiredKeys<T> = Exclude<KeysOfType<T, Exclude<T[keyof T], undefined>>, undefined>;
/**
 * Get all the required keys on the types in the tuple.
 */
declare type RequiredKeysOf<Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>> = RequiredKeysOfHelper<Ts, never>;
/**
 * Tail-recursive helper type for RequiredKeysOf.
 */
declare type RequiredKeysOfHelper<Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>, Acc> = Ts extends Readonly<readonly [infer Head, ...infer Rest]> ? Head extends Record<PropertyKey, unknown> ? Rest extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]> ? RequiredKeysOfHelper<Rest, Acc | RequiredKeys<Head>> : Acc | RequiredKeys<Head> : never : Acc;
/**
 * Get the optional keys of the type.
 */
declare type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;
/**
 * Get all the optional keys on the types in the tuple.
 */
declare type OptionalKeysOf<Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>> = OptionalKeysOfHelper<Ts, never>;
/**
 * Tail-recursive helper type for OptionalKeysOf.
 */
declare type OptionalKeysOfHelper<Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>, Acc> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Record<PropertyKey, unknown> ? Rest extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]> ? OptionalKeysOfHelper<Rest, Acc | OptionalKeys<Head>> : Acc | OptionalKeys<Head> : never : Acc;
/**
 * Filter out nevers from a tuple.
 */
declare type FilterOutNever<T extends Readonly<ReadonlyArray<unknown>>> = FilterOutNeverHelper<T, []>;
/**
 * Tail-recursive helper type for FilterOutNever.
 */
declare type FilterOutNeverHelper<T extends Readonly<ReadonlyArray<unknown>>, Acc extends Readonly<ReadonlyArray<unknown>>> = T extends Readonly<readonly []> ? Acc : T extends Readonly<readonly [infer Head, ...infer Rest]> ? IsNever<Head> extends true ? FilterOutNeverHelper<Rest, Acc> : FilterOutNeverHelper<Rest, [...Acc, Head]> : T;
/**
 * Is the type a tuple?
 */
declare type IsTuple<T extends Readonly<ReadonlyArray<unknown>>> = T extends Readonly<readonly []> ? true : T extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]> ? true : false;

/**
 * Mapping of merge function URIs to the merge function type.
 */
interface DeepMergeMergeFunctionURItoKind<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> {
    readonly DeepMergeLeafURI: DeepMergeLeafHKT<Ts, MF>;
    readonly DeepMergeRecordsDefaultURI: DeepMergeRecordsDefaultHKT<Ts, MF>;
    readonly DeepMergeArraysDefaultURI: DeepMergeArraysDefaultHKT<Ts, MF>;
    readonly DeepMergeSetsDefaultURI: DeepMergeSetsDefaultHKT<Ts, MF>;
    readonly DeepMergeMapsDefaultURI: DeepMergeMapsDefaultHKT<Ts, MF>;
}
/**
 * Get the type of the given merge function via its URI.
 */
declare type DeepMergeMergeFunctionKind<URI extends DeepMergeMergeFunctionURIs, Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = DeepMergeMergeFunctionURItoKind<Ts, MF>[URI];
/**
 * A union of all valid merge function URIs.
 */
declare type DeepMergeMergeFunctionURIs = keyof DeepMergeMergeFunctionURItoKind<Readonly<ReadonlyArray<unknown>>, DeepMergeMergeFunctionsURIs>;
/**
 * The merge functions to use when deep merging.
 */
declare type DeepMergeMergeFunctionsURIs = Readonly<{
    /**
     * The merge function to merge records with.
     */
    DeepMergeRecordsURI: DeepMergeMergeFunctionURIs;
    /**
     * The merge function to merge arrays with.
     */
    DeepMergeArraysURI: DeepMergeMergeFunctionURIs;
    /**
     * The merge function to merge sets with.
     */
    DeepMergeSetsURI: DeepMergeMergeFunctionURIs;
    /**
     * The merge function to merge maps with.
     */
    DeepMergeMapsURI: DeepMergeMergeFunctionURIs;
    /**
     * The merge function to merge other things with.
     */
    DeepMergeOthersURI: DeepMergeMergeFunctionURIs;
}>;
/**
 * Deep merge types.
 */
declare type DeepMergeHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = IsTuple<Ts> extends true ? Ts extends Readonly<readonly []> ? undefined : Ts extends Readonly<readonly [infer T1]> ? T1 : EveryIsArray<Ts> extends true ? DeepMergeArraysHKT<Ts, MF> : EveryIsMap<Ts> extends true ? DeepMergeMapsHKT<Ts, MF> : EveryIsSet<Ts> extends true ? DeepMergeSetsHKT<Ts, MF> : EveryIsRecord<Ts> extends true ? DeepMergeRecordsHKT<Ts, MF> : DeepMergeOthersHKT<Ts, MF> : unknown;
/**
 * Deep merge records.
 */
declare type DeepMergeRecordsHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = DeepMergeMergeFunctionKind<MF["DeepMergeRecordsURI"], Ts, MF>;
/**
 * Deep merge arrays.
 */
declare type DeepMergeArraysHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = DeepMergeMergeFunctionKind<MF["DeepMergeArraysURI"], Ts, MF>;
/**
 * Deep merge sets.
 */
declare type DeepMergeSetsHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = DeepMergeMergeFunctionKind<MF["DeepMergeSetsURI"], Ts, MF>;
/**
 * Deep merge maps.
 */
declare type DeepMergeMapsHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = DeepMergeMergeFunctionKind<MF["DeepMergeMapsURI"], Ts, MF>;
/**
 * Deep merge other things.
 */
declare type DeepMergeOthersHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = DeepMergeMergeFunctionKind<MF["DeepMergeOthersURI"], Ts, MF>;
/**
 * The merge function that returns a leaf.
 */
declare type DeepMergeLeafURI = "DeepMergeLeafURI";
/**
 * Get the leaf type from 2 types that can't be merged.
 */
declare type DeepMergeLeafHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = DeepMergeLeaf<Ts>;
/**
 * Get the leaf type from many types that can't be merged.
 */
declare type DeepMergeLeaf<Ts extends Readonly<ReadonlyArray<unknown>>> = Ts extends Readonly<readonly []> ? never : Ts extends Readonly<readonly [infer T]> ? T : Ts extends Readonly<readonly [...infer Rest, infer Tail]> ? IsNever<Tail> extends true ? Rest extends Readonly<ReadonlyArray<unknown>> ? DeepMergeLeaf<Rest> : never : Tail : never;

/**
 * The default merge function to merge records with.
 */
declare type DeepMergeRecordsDefaultURI = "DeepMergeRecordsDefaultURI";
/**
 * The default merge function to merge arrays with.
 */
declare type DeepMergeArraysDefaultURI = "DeepMergeArraysDefaultURI";
/**
 * The default merge function to merge sets with.
 */
declare type DeepMergeSetsDefaultURI = "DeepMergeSetsDefaultURI";
/**
 * The default merge function to merge maps with.
 */
declare type DeepMergeMapsDefaultURI = "DeepMergeMapsDefaultURI";
/**
 * The default merge functions to use when deep merging.
 */
declare type DeepMergeMergeFunctionsDefaultURIs = Readonly<{
    DeepMergeRecordsURI: DeepMergeRecordsDefaultURI;
    DeepMergeArraysURI: DeepMergeArraysDefaultURI;
    DeepMergeSetsURI: DeepMergeSetsDefaultURI;
    DeepMergeMapsURI: DeepMergeMapsDefaultURI;
    DeepMergeOthersURI: DeepMergeLeafURI;
}>;
/**
 * A union of all the props that should not be included in type information for
 * merged records.
 */
declare type BlacklistedRecordProps = "__proto__";
/**
 * Deep merge records.
 */
declare type DeepMergeRecordsDefaultHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]> ? FlatternAlias<Omit<DeepMergeRecordsDefaultHKTInternalProps<Ts, MF>, BlacklistedRecordProps>> : {};
/**
 * Deep merge record props.
 */
declare type DeepMergeRecordsDefaultHKTInternalProps<Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>, MF extends DeepMergeMergeFunctionsURIs> = {
    [K in OptionalKeysOf<Ts>]?: DeepMergeHKT<DeepMergeRecordsDefaultHKTInternalPropValue<Ts, K>, MF>;
} & {
    [K in RequiredKeysOf<Ts>]: DeepMergeHKT<DeepMergeRecordsDefaultHKTInternalPropValue<Ts, K>, MF>;
};
/**
 * Get the value of the property.
 */
declare type DeepMergeRecordsDefaultHKTInternalPropValue<Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>, K extends PropertyKey> = FilterOutNever<DeepMergeRecordsDefaultHKTInternalPropValueHelper<Ts, K, Readonly<readonly []>>>;
/**
 * Tail-recursive helper type for DeepMergeRecordsDefaultHKTInternalPropValue.
 */
declare type DeepMergeRecordsDefaultHKTInternalPropValueHelper<Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>, K extends PropertyKey, Acc extends Readonly<ReadonlyArray<unknown>>> = Ts extends Readonly<readonly [infer Head, ...infer Rest]> ? Head extends Record<PropertyKey, unknown> ? Rest extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]> ? DeepMergeRecordsDefaultHKTInternalPropValueHelper<Rest, K, [
    ...Acc,
    ValueOfKey<Head, K>
]> : [...Acc, ValueOfKey<Head, K>] : never : never;
/**
 * Deep merge 2 arrays.
 */
declare type DeepMergeArraysDefaultHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = DeepMergeArraysDefaultHKTHelper<Ts, MF, []>;
/**
 * Tail-recursive helper type for DeepMergeArraysDefaultHKT.
 */
declare type DeepMergeArraysDefaultHKTHelper<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs, Acc extends Readonly<ReadonlyArray<unknown>>> = Ts extends readonly [infer Head, ...infer Rest] ? Head extends Readonly<ReadonlyArray<unknown>> ? Rest extends readonly [
    Readonly<ReadonlyArray<unknown>>,
    ...Readonly<ReadonlyArray<Readonly<ReadonlyArray<unknown>>>>
] ? DeepMergeArraysDefaultHKTHelper<Rest, MF, [...Acc, ...Head]> : [...Acc, ...Head] : never : never;
/**
 * Deep merge 2 sets.
 */
declare type DeepMergeSetsDefaultHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = Set<UnionSetValues<Ts>>;
/**
 * Deep merge 2 maps.
 */
declare type DeepMergeMapsDefaultHKT<Ts extends Readonly<ReadonlyArray<unknown>>, MF extends DeepMergeMergeFunctionsURIs> = Map<UnionMapKeys<Ts>, UnionMapValues<Ts>>;
/**
 * Get the merge functions with defaults apply from the given subset.
 */
declare type GetDeepMergeMergeFunctionsURIs<PMF extends Partial<DeepMergeMergeFunctionsURIs>> = Readonly<{
    DeepMergeRecordsURI: PMF["DeepMergeRecordsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any> ? PMF["DeepMergeRecordsURI"] : DeepMergeRecordsDefaultURI;
    DeepMergeArraysURI: PMF["DeepMergeArraysURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any> ? PMF["DeepMergeArraysURI"] : DeepMergeArraysDefaultURI;
    DeepMergeSetsURI: PMF["DeepMergeSetsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any> ? PMF["DeepMergeSetsURI"] : DeepMergeSetsDefaultURI;
    DeepMergeMapsURI: PMF["DeepMergeMapsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any> ? PMF["DeepMergeMapsURI"] : DeepMergeMapsDefaultURI;
    DeepMergeOthersURI: PMF["DeepMergeOthersURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any> ? PMF["DeepMergeOthersURI"] : DeepMergeLeafURI;
}>;

/**
 * The options the user can pass to customize deepmerge.
 */
declare type DeepMergeOptions = Partial<DeepMergeOptionsFull>;
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
    mergeRecords: <Ts extends Readonly<ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => unknown;
    mergeArrays: <Ts extends Readonly<ReadonlyArray<Readonly<ReadonlyArray<unknown>>>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => unknown;
    mergeMaps: <Ts extends Readonly<ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => unknown;
    mergeSets: <Ts extends Readonly<ReadonlyArray<Readonly<ReadonlySet<unknown>>>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => unknown;
    mergeOthers: <Ts extends Readonly<ReadonlyArray<unknown>>, U extends DeepMergeMergeFunctionUtils>(records: Ts, utils: U) => unknown;
}>;
/**
 * The utils provided to the merge functions.
 */
declare type DeepMergeMergeFunctionUtils = Readonly<{
    mergeFunctions: DeepMergeMergeFunctions;
    defaultMergeFunctions: DeepMergeMergeFunctionsDefaults;
    deepmerge: <Ts extends Readonly<ReadonlyArray<unknown>>>(...values: Ts) => unknown;
}>;

declare const defaultOptions: {
    readonly mergeMaps: typeof mergeMaps;
    readonly mergeSets: typeof mergeSets;
    readonly mergeArrays: typeof mergeArrays;
    readonly mergeRecords: typeof mergeRecords;
    readonly mergeOthers: typeof leaf;
};
/**
 * The default merge functions.
 */
declare type DeepMergeMergeFunctionsDefaults = typeof defaultOptions;
/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
declare function deepmerge<Ts extends Readonly<ReadonlyArray<unknown>>>(...objects: Readonly<readonly [...Ts]>): DeepMergeHKT<Ts, DeepMergeMergeFunctionsDefaultURIs>;
/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
declare function deepmergeCustom<PMF extends Partial<DeepMergeMergeFunctionsURIs>>(options: DeepMergeOptions): <Ts extends Readonly<ReadonlyArray<unknown>>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>>;
/**
 * Merge records.
 *
 * @param values - The records.
 */
declare function mergeRecords<Ts extends Readonly<ReadonlyArray<Record<PropertyKey, unknown>>>, U extends DeepMergeMergeFunctionUtils, MF extends DeepMergeMergeFunctionsURIs>(values: Ts, utils: U): DeepMergeRecordsDefaultHKT<Ts, MF>;
/**
 * Merge arrays.
 *
 * @param values - The arrays.
 */
declare function mergeArrays<Ts extends Readonly<ReadonlyArray<Readonly<ReadonlyArray<unknown>>>>, U extends DeepMergeMergeFunctionUtils, MF extends DeepMergeMergeFunctionsURIs>(values: Ts, utils: U): Ts extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? Rest extends readonly [infer Head, ...infer Rest] ? Head extends readonly unknown[] ? Rest extends readonly [readonly unknown[], ...(readonly unknown[])[]] ? any : [...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head] : never : never : [...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head] : never : never : [...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head] : never : never : [...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head] : never : never : [...Head, ...Head, ...Head, ...Head, ...Head, ...Head, ...Head] : never : never : [...Head, ...Head, ...Head, ...Head, ...Head, ...Head] : never : never : [...Head, ...Head, ...Head, ...Head, ...Head] : never : never : [...Head, ...Head, ...Head, ...Head] : never : never : [...Head, ...Head, ...Head] : never : never : [...Head, ...Head] : never : never : [...Head] : never : never;
/**
 * Merge sets.
 *
 * @param values - The sets.
 */
declare function mergeSets<Ts extends Readonly<ReadonlyArray<Readonly<ReadonlySet<unknown>>>>, U extends DeepMergeMergeFunctionUtils, MF extends DeepMergeMergeFunctionsURIs>(values: Ts, utils: U): DeepMergeSetsDefaultHKT<Ts, MF>;
/**
 * Merge maps.
 *
 * @param values - The maps.
 */
declare function mergeMaps<Ts extends Readonly<ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>>, U extends DeepMergeMergeFunctionUtils, MF extends DeepMergeMergeFunctionsURIs>(values: Ts, utils: U): DeepMergeMapsDefaultHKT<Ts, MF>;
/**
 * Merge "other" things.
 *
 * @param values - The values.
 */
declare function leaf<Ts extends Readonly<ReadonlyArray<unknown>>, U extends DeepMergeMergeFunctionUtils, MF extends DeepMergeMergeFunctionsURIs>(values: Ts, utils: U): unknown;

export { DeepMergeArraysDefaultHKT, DeepMergeHKT, DeepMergeLeaf, DeepMergeLeafHKT, DeepMergeLeafURI, DeepMergeMapsDefaultHKT, DeepMergeMergeFunctionURItoKind, DeepMergeMergeFunctionUtils, DeepMergeMergeFunctionsDefaultURIs, DeepMergeMergeFunctionsDefaults, DeepMergeMergeFunctionsURIs, DeepMergeOptions, DeepMergeRecordsDefaultHKT, DeepMergeSetsDefaultHKT, deepmerge, deepmergeCustom };
