/**
 * Simplify a complex type such as a union or intersection of objects into a
 * single object.
 */
type SimplifyObject<T extends {}> = {
    [K in keyof T]: T[K];
} & {};
/**
 * Flatten a collection of tuples of tuples into a collection of tuples.
 */
type FlattenTuples<T> = {
    [I in keyof T]: FlattenTuple<T[I]>;
};
/**
 * Flatten a tuple of tuples into a single tuple.
 */
type FlattenTuple<T> = T extends readonly [
] ? [
] : T extends readonly [
    infer T0
] ? [
    ...FlattenTuple<T0>
] : T extends readonly [
    infer T0,
    ...infer Ts
] ? [
    ...FlattenTuple<T0>,
    ...FlattenTuple<Ts>
] : [
    T
];
/**
 * Safely test whether or not the first given types extends the second.
 *
 * Needed in particular for testing if a type is "never".
 */
type Is<T1, T2> = [
    T1
] extends [
    T2
] ? true : false;
/**
 * Safely test whether or not the given type is "never".
 */
type IsNever<T> = Is<T, never>;
/**
 * And operator for types.
 */
type And<T1 extends boolean, T2 extends boolean> = T1 extends false ? false : T2;
/**
 * Not operator for types.
 */
type Not<T extends boolean> = T extends true ? false : true;
/**
 * Check if a key is optional in the given object.
 */
type KeyIsOptional<K extends PropertyKey, O extends {
    [Key in K]?: unknown;
}> = O extends {
    [Key in K]: unknown;
} ? false : true;
/**
 * Returns whether or not the given type a record.
 */
type IsRecord<T> = And<Not<IsNever<T>>, T extends Readonly<Record<PropertyKey, unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are records.
 */
type EveryIsRecord<Ts extends ReadonlyArray<unknown>> = Ts extends readonly [
    infer Head,
    ...infer Rest
] ? IsRecord<Head> extends true ? Rest extends ReadonlyArray<unknown> ? EveryIsRecord<Rest> : true : false : true;
/**
 * Returns whether or not the given type is an array.
 */
type IsArray<T> = And<Not<IsNever<T>>, T extends ReadonlyArray<unknown> ? true : false>;
/**
 * Returns whether or not all the given types are arrays.
 */
type EveryIsArray<Ts extends ReadonlyArray<unknown>> = Ts extends readonly [
    infer T1
] ? IsArray<T1> : Ts extends readonly [
    infer Head,
    ...infer Rest
] ? IsArray<Head> extends true ? Rest extends readonly [
    unknown,
    ...ReadonlyArray<unknown>
] ? EveryIsArray<Rest> : false : false : false;
/**
 * Returns whether or not the given type is an set.
 *
 * Note: This may also return true for Maps.
 */
type IsSet<T> = And<Not<IsNever<T>>, T extends Readonly<ReadonlySet<unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are sets.
 *
 * Note: This may also return true if all are maps.
 */
type EveryIsSet<Ts extends ReadonlyArray<unknown>> = Ts extends Readonly<readonly [
    infer T1
]> ? IsSet<T1> : Ts extends readonly [
    infer Head,
    ...infer Rest
] ? IsSet<Head> extends true ? Rest extends readonly [
    unknown,
    ...ReadonlyArray<unknown>
] ? EveryIsSet<Rest> : false : false : false;
/**
 * Returns whether or not the given type is an map.
 */
type IsMap<T> = And<Not<IsNever<T>>, T extends Readonly<ReadonlyMap<unknown, unknown>> ? true : false>;
/**
 * Returns whether or not all the given types are maps.
 */
type EveryIsMap<Ts extends ReadonlyArray<unknown>> = Ts extends Readonly<readonly [
    infer T1
]> ? IsMap<T1> : Ts extends readonly [
    infer Head,
    ...infer Rest
] ? IsMap<Head> extends true ? Rest extends readonly [
    unknown,
    ...ReadonlyArray<unknown>
] ? EveryIsMap<Rest> : false : false : false;
/**
 * Union of the sets' values' types
 */
type UnionSetValues<Ts extends ReadonlyArray<unknown>> = UnionSetValuesHelper<Ts, never>;
/**
 * Tail-recursive helper type for UnionSetValues.
 */
type UnionSetValuesHelper<Ts extends ReadonlyArray<unknown>, Acc> = Ts extends readonly [
    infer Head,
    ...infer Rest
] ? Head extends Readonly<ReadonlySet<infer V1>> ? Rest extends ReadonlyArray<unknown> ? UnionSetValuesHelper<Rest, Acc | V1> : Acc | V1 : never : Acc;
/**
 * Union of the maps' values' types
 */
type UnionMapKeys<Ts extends ReadonlyArray<unknown>> = UnionMapKeysHelper<Ts, never>;
/**
 * Tail-recursive helper type for UnionMapKeys.
 */
type UnionMapKeysHelper<Ts extends ReadonlyArray<unknown>, Acc> = Ts extends readonly [
    infer Head,
    ...infer Rest
] ? Head extends Readonly<ReadonlyMap<infer K1, unknown>> ? Rest extends readonly [
] ? Acc | K1 : UnionMapKeysHelper<Rest, Acc | K1> : never : Acc;
/**
 * Union of the maps' keys' types
 */
type UnionMapValues<Ts extends ReadonlyArray<unknown>> = UnionMapValuesHelper<Ts, never>;
/**
 * Tail-recursive helper type for UnionMapValues.
 */
type UnionMapValuesHelper<Ts extends ReadonlyArray<unknown>, Acc> = Ts extends readonly [
    infer Head,
    ...infer Rest
] ? Head extends Readonly<ReadonlyMap<unknown, infer V1>> ? Rest extends readonly [
] ? Acc | V1 : UnionMapValuesHelper<Rest, Acc | V1> : never : Acc;
/**
 * Filter out U from a tuple.
 */
type FilterOut<T extends ReadonlyArray<unknown>, U> = FilterOutHelper<T, U, [
]>;
/**
 * Tail-recursive helper type for FilterOut.
 */
type FilterOutHelper<T extends ReadonlyArray<unknown>, U, Acc extends ReadonlyArray<unknown>> = T extends readonly [
] ? Acc : T extends readonly [
    infer Head,
    ...infer Rest
] ? Is<Head, U> extends true ? FilterOutHelper<Rest, U, Acc> : FilterOutHelper<Rest, U, [
    ...Acc,
    Head
]> : T;
/**
 * Filter out nevers from a tuple.
 */
type FilterOutNever<T> = T extends ReadonlyArray<unknown> ? FilterOut<T, never> : never;
/**
 * Is the type a tuple?
 */
type IsTuple<T extends ReadonlyArray<unknown>> = T extends readonly [
] ? true : T extends readonly [
    unknown,
    ...ReadonlyArray<unknown>
] ? true : false;
/**
 * Perfrom a transpose operation on a 2D tuple.
 */
type TransposeTuple<T> = T extends readonly [
    ...(readonly [
        ...unknown[]
    ])
] ? T extends readonly [
] ? [
] : T extends readonly [
    infer X extends ReadonlyArray<unknown>
] ? TransposeTupleSimpleCase<X> : T extends readonly [
    infer X extends ReadonlyArray<unknown>,
    ...infer XS extends ReadonlyArray<ReadonlyArray<unknown>>
] ? PrependCol<X, TransposeTuple<XS>> : T : never;
type PrependCol<T extends ReadonlyArray<unknown>, S extends ReadonlyArray<ReadonlyArray<unknown>>> = T extends readonly [
] ? S extends readonly [
] ? [
] : never : T extends readonly [
    infer X,
    ...infer XS
] ? S extends readonly [
    readonly [
        ...infer Y
    ],
    ...infer YS extends ReadonlyArray<ReadonlyArray<unknown>>
] ? [
    [
        X,
        ...Y
    ],
    ...PrependCol<XS, YS>
] : never : never;
type TransposeTupleSimpleCase<T extends readonly [
    ...unknown[]
]> = T extends readonly [
] ? [
] : T extends readonly [
    infer X,
    ...infer XS
] ? [
    [
        X
    ],
    ...TransposeTupleSimpleCase<XS>
] : never;
/**
 * Convert a tuple to an intersection of each of its types.
 */
type TupleToIntersection<T extends ReadonlyArray<unknown>> = {
    [K in keyof T]: (x: T[K]) => void;
} extends Record<number, (x: infer I) => void> ? I : never;
/**
 * Convert a union to a tuple.
 *
 * Warning: The order of the elements is non-deterministic.
 * Warning 2: The union maybe me modified by the TypeScript engine before convertion.
 * Warning 3: This implementation relies on a hack/limitation in TypeScript.
 */
type TuplifyUnion<T, L = LastOf<T>> = IsNever<T> extends true ? [
] : [
    ...TuplifyUnion<Exclude<T, L>>,
    L
];
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
type LastOf<T> = UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never;
/**
 * Mapping of merge function URIs to the merge function type.
 */
// eslint-disable-next-line ts/consistent-type-definitions
interface DeepMergeFunctionURItoKind<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, in out M> {
    readonly DeepMergeLeafURI: DeepMergeLeaf<Ts>;
    readonly DeepMergeRecordsDefaultURI: DeepMergeRecordsDefaultHKT<Ts, Fs, M>;
    readonly DeepMergeArraysDefaultURI: DeepMergeArraysDefaultHKT<Ts, Fs, M>;
    readonly DeepMergeSetsDefaultURI: DeepMergeSetsDefaultHKT<Ts>;
    readonly DeepMergeMapsDefaultURI: DeepMergeMapsDefaultHKT<Ts>;
    readonly DeepMergeFilterValuesDefaultURI: DeepMergeFilterValuesDefaultHKT<Ts>;
    readonly DeepMergeNoFilteringURI: Ts;
}
/**
 * Get the type of the given merge function via its URI.
 */
type DeepMergeFunctionKind<URI extends DeepMergeFunctionURIs, Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionURItoKind<Ts, Fs, M>[URI];
/**
 * A union of all valid merge function URIs.
 */
type DeepMergeFunctionURIs = keyof DeepMergeFunctionURItoKind<ReadonlyArray<unknown>, DeepMergeFunctionsURIs, unknown>;
/**
 * The merge functions to use when deep merging.
 */
type DeepMergeFunctionsURIs = Readonly<{
    /**
     * The merge function to merge records with.
     */
    DeepMergeRecordsURI: DeepMergeFunctionURIs;
    /**
     * The merge function to merge arrays with.
     */
    DeepMergeArraysURI: DeepMergeFunctionURIs;
    /**
     * The merge function to merge sets with.
     */
    DeepMergeSetsURI: DeepMergeFunctionURIs;
    /**
     * The merge function to merge maps with.
     */
    DeepMergeMapsURI: DeepMergeFunctionURIs;
    /**
     * The merge function to merge other things with.
     */
    DeepMergeOthersURI: DeepMergeFunctionURIs;
    /**
     * The function to filter values.
     */
    DeepMergeFilterValuesURI: DeepMergeFunctionURIs;
}>;
/**
 * Deep merge types.
 */
type DeepMergeHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = IsTuple<Ts> extends true ? Ts extends readonly [
] ? undefined : DeepMergeHKTHelper<FilterValuesHKT<Ts, Fs, M>, Fs, M> : unknown;
type DeepMergeHKTHelper<Ts, Fs extends DeepMergeFunctionsURIs, M> = Ts extends ReadonlyArray<unknown> ? IsTuple<Ts> extends true ? Ts extends readonly [
] ? unknown : Ts extends readonly [
    infer T1
] ? T1 : EveryIsArray<Ts> extends true ? DeepMergeArraysHKT<Ts, Fs, M> : EveryIsMap<Ts> extends true ? DeepMergeMapsHKT<Ts, Fs, M> : EveryIsSet<Ts> extends true ? DeepMergeSetsHKT<Ts, Fs, M> : EveryIsRecord<Ts> extends true ? DeepMergeRecordsHKT<Ts, Fs, M> : DeepMergeOthersHKT<Ts, Fs, M> : unknown : never;
/**
 * Deep merge records.
 */
type DeepMergeRecordsHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionKind<Fs["DeepMergeRecordsURI"], Ts, Fs, M>;
/**
 * Deep merge arrays.
 */
type DeepMergeArraysHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionKind<Fs["DeepMergeArraysURI"], Ts, Fs, M>;
/**
 * Deep merge sets.
 */
type DeepMergeSetsHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionKind<Fs["DeepMergeSetsURI"], Ts, Fs, M>;
/**
 * Deep merge maps.
 */
type DeepMergeMapsHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionKind<Fs["DeepMergeMapsURI"], Ts, Fs, M>;
/**
 * Deep merge other things.
 */
type DeepMergeOthersHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionKind<Fs["DeepMergeOthersURI"], Ts, Fs, M>;
/**
 * Filter values.
 */
type FilterValuesHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionKind<Fs["DeepMergeFilterValuesURI"], Ts, Fs, M>;
/**
 * The merge function that returns a leaf.
 */
type DeepMergeLeafURI = "DeepMergeLeafURI";
/**
 * Don't filter values.
 */
type DeepMergeNoFilteringURI = "DeepMergeNoFilteringURI";
/**
 * Get the leaf type from many types that can't be merged.
 */
type DeepMergeLeaf<Ts extends ReadonlyArray<unknown>> = Ts extends readonly [
] ? never : Ts extends readonly [
    infer T
] ? T : Ts extends readonly [
    ...infer Rest,
    infer Tail
] ? IsNever<Tail> extends true ? Rest extends ReadonlyArray<unknown> ? DeepMergeLeaf<Rest> : never : Tail : never;
/**
 * The meta data deepmerge is able to provide.
 */
type DeepMergeBuiltInMetaData = Readonly<{
    key: PropertyKey;
    parents: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>;
}>;
/**
 * The default merge function to merge records with.
 */
type DeepMergeRecordsDefaultURI = "DeepMergeRecordsDefaultURI";
/**
 * The default merge function to merge arrays with.
 */
type DeepMergeArraysDefaultURI = "DeepMergeArraysDefaultURI";
/**
 * The default merge function to merge sets with.
 */
type DeepMergeSetsDefaultURI = "DeepMergeSetsDefaultURI";
/**
 * The default merge function to merge maps with.
 */
type DeepMergeMapsDefaultURI = "DeepMergeMapsDefaultURI";
/**
 * The default filter values function.
 */
type DeepMergeFilterValuesDefaultURI = "DeepMergeFilterValuesDefaultURI";
/**
 * The default merge functions to use when deep merging.
 */
type DeepMergeFunctionsDefaultURIs = Readonly<{
    DeepMergeRecordsURI: DeepMergeRecordsDefaultURI;
    DeepMergeArraysURI: DeepMergeArraysDefaultURI;
    DeepMergeSetsURI: DeepMergeSetsDefaultURI;
    DeepMergeMapsURI: DeepMergeMapsDefaultURI;
    DeepMergeOthersURI: DeepMergeLeafURI;
    DeepMergeFilterValuesURI: DeepMergeFilterValuesDefaultURI;
}>;
type RecordEntries<T extends Record<PropertyKey, unknown>> = FilterOut<TuplifyUnion<{
    [K in keyof T]: [
        K,
        T[K]
    ];
}[keyof T]>, undefined>;
type RecordMeta = Record<PropertyKey, RecordPropertyMeta>;
type RecordPropertyMeta<Key extends PropertyKey = PropertyKey, Value = unknown, Optional extends boolean = boolean> = {
    key: Key;
    value: Value;
    optional: Optional;
};
type RecordsToRecordMeta<Ts extends ReadonlyArray<Record<PropertyKey, unknown>>> = FilterOutNever<{
    [I in keyof Ts]: RecordToRecordMeta<Ts[I]>;
}>;
type RecordToRecordMeta<T extends Record<PropertyKey, unknown>> = {
    [K in keyof T]-?: {
        key: K;
        value: Required<T>[K];
        optional: KeyIsOptional<K, T>;
    };
};
/**
 * Deep merge records.
 */
type DeepMergeRecordsDefaultHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = Ts extends ReadonlyArray<Record<PropertyKey, unknown>> ? SimplifyObject<DeepMergeRecordMetaDefaultHKTProps<RecordsToRecordMeta<Ts>, Fs, M>> : never;
/**
 * Deep merge record props.
 */
type DeepMergeRecordMetaDefaultHKTProps<RecordMetas, Fs extends DeepMergeFunctionsURIs, M> = RecordMetas extends ReadonlyArray<RecordMeta> ? CreateRecordFromMeta<MergeRecordMeta<RecordMetas>, Fs, M> : never;
type MergeRecordMeta<RecordMetas extends ReadonlyArray<RecordMeta>> = GroupValuesByKey<FlattenTuples<TransposeTuple<FilterOut<{
    [I in keyof RecordMetas]: TransposeTuple<RecordEntries<RecordMetas[I]>>;
}, readonly [
]>>>>;
type GroupValuesByKey<Ts> = Ts extends readonly [
    infer Keys extends ReadonlyArray<PropertyKey>,
    infer Values
] ? {
    [I in keyof Keys]: DeepMergeRecordPropertyMetaDefaultHKTGetPossible<Keys[I], FilterOutNever<{
        [J in keyof Values]: Values[J] extends {
            key: Keys[I];
        } ? Values[J] : never;
    }>>;
} : never;
type CreateRecordFromMeta<Ts, Fs extends DeepMergeFunctionsURIs, M> = Ts extends ReadonlyArray<unknown> ? TupleToIntersection<{
    [I in keyof Ts]: Ts[I] extends {
        key: infer Key extends PropertyKey;
        values: infer Values extends ReadonlyArray<unknown>;
        optional: infer O extends boolean;
    } ? CreateRecordForKeyFromMeta<Key, Values, O, Fs, M> : never;
}> : never;
type CreateRecordForKeyFromMeta<Key extends PropertyKey, Values extends ReadonlyArray<unknown>, Optional extends boolean, Fs extends DeepMergeFunctionsURIs, M> = Optional extends true ? {
    [k in Key]+?: DeepMergeHKT<Values, Fs, M>;
} : {
    [k in Key]-?: DeepMergeHKT<Values, Fs, M>;
};
/**
 * Get the possible types of a property.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetPossible<Key extends PropertyKey, Ts> = Ts extends readonly [
    RecordPropertyMeta,
    ...ReadonlyArray<RecordPropertyMeta>
] ? DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<Ts, {
    key: Key;
    values: [
    ];
    optional: never;
}> : never;
/**
 * Tail-recursive helper type for DeepMergeRecordPropertyMetaDefaultHKTGetPossible.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<Ts extends readonly [
    RecordPropertyMeta,
    ...ReadonlyArray<RecordPropertyMeta>
], Acc extends {
    key: PropertyKey;
    values: ReadonlyArray<unknown>;
    optional: boolean;
}> = Ts extends [
    ...infer Rest,
    {
        key: infer K extends PropertyKey;
        value: infer V;
        optional: infer O extends boolean;
    }
] ? Acc["optional"] extends true ? Acc extends {
    values: [
        infer Head,
        ...infer AccRest
    ];
} ? Rest extends readonly [
    RecordPropertyMeta,
    ...ReadonlyArray<RecordPropertyMeta>
] ? DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<Rest, {
    key: K;
    values: [
        V | Head,
        ...AccRest
    ];
    optional: O;
}> : {
    key: K;
    values: [
        V | Head,
        ...AccRest
    ];
    optional: O;
} : Rest extends readonly [
    RecordPropertyMeta,
    ...ReadonlyArray<RecordPropertyMeta>
] ? DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<Rest, {
    key: K;
    values: [
        V,
        ...Acc["values"]
    ];
    optional: O;
}> : {
    key: K;
    values: [
        V,
        ...Acc["values"]
    ];
    optional: O;
} : Rest extends readonly [
    RecordPropertyMeta,
    ...ReadonlyArray<RecordPropertyMeta>
] ? DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<Rest, {
    key: K;
    values: [
        V,
        ...Acc["values"]
    ];
    optional: O;
}> : {
    key: K;
    values: [
        V,
        ...Acc["values"]
    ];
    optional: O;
} : never;
/**
 * Deep merge arrays.
 */
type DeepMergeArraysDefaultHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeArraysDefaultHKTHelper<Ts, Fs, M, [
]>;
/**
 * Tail-recursive helper type for DeepMergeArraysDefaultHKT.
 */
type DeepMergeArraysDefaultHKTHelper<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M, Acc extends ReadonlyArray<unknown>> = Ts extends readonly [
    infer Head extends ReadonlyArray<unknown>,
    ...infer Rest
] ? Rest extends readonly [
    ReadonlyArray<unknown>,
    ...ReadonlyArray<ReadonlyArray<unknown>>
] ? DeepMergeArraysDefaultHKTHelper<Rest, Fs, M, [
    ...Acc,
    ...Head
]> : [
    ...Acc,
    ...Head
] : never;
/**
 * Deep merge sets.
 */
type DeepMergeSetsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Set<UnionSetValues<Ts>>;
/**
 * Deep merge maps.
 */
type DeepMergeMapsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Map<UnionMapKeys<Ts>, UnionMapValues<Ts>>;
/**
 * Filter out undefined values.
 */
type DeepMergeFilterValuesDefaultHKT<Ts extends ReadonlyArray<unknown>> = FilterOut<Ts, undefined>;
/**
 * Get the merge functions with defaults apply from the given subset.
 */
type GetDeepMergeFunctionsURIs<PMF extends Partial<DeepMergeFunctionsURIs>> = Readonly<{
    // prettier-ignore
    DeepMergeRecordsURI: PMF["DeepMergeRecordsURI"] extends keyof DeepMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeRecordsURI"] : DeepMergeRecordsDefaultURI;
    // prettier-ignore
    DeepMergeArraysURI: PMF["DeepMergeArraysURI"] extends keyof DeepMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeArraysURI"] : DeepMergeArraysDefaultURI;
    // prettier-ignore
    DeepMergeSetsURI: PMF["DeepMergeSetsURI"] extends keyof DeepMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeSetsURI"] : DeepMergeSetsDefaultURI;
    // prettier-ignore
    DeepMergeMapsURI: PMF["DeepMergeMapsURI"] extends keyof DeepMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeMapsURI"] : DeepMergeMapsDefaultURI;
    // prettier-ignore
    DeepMergeOthersURI: PMF["DeepMergeOthersURI"] extends keyof DeepMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeOthersURI"] : DeepMergeLeafURI;
    // prettier-ignore
    DeepMergeFilterValuesURI: PMF["DeepMergeFilterValuesURI"] extends keyof DeepMergeFunctionURItoKind<any, any, any> ? PMF["DeepMergeFilterValuesURI"] : DeepMergeFilterValuesDefaultURI;
}>;
/**
 * The default merge functions.
 */
type MergeFunctions = {
    mergeRecords: typeof mergeRecordsInto;
    mergeArrays: typeof mergeArraysInto;
    mergeSets: typeof mergeSetsInto;
    mergeMaps: typeof mergeMapsInto;
    mergeOthers: typeof mergeOthersInto;
};
/**
 * The default strategy to merge records into a target record.
 *
 * @param m_target - The result will be mutated into this record
 * @param values - The records (including the target's value if there is one).
 */
declare function mergeRecordsInto<Ts extends ReadonlyArray<Record<PropertyKey, unknown>>, U extends DeepMergeIntoFunctionUtils<M, MM>, M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData>(m_target: Reference<Record<PropertyKey, unknown>>, values: Ts, utils: U, meta: M | undefined): void;
/**
 * The default strategy to merge arrays into a target array.
 *
 * @param m_target - The result will be mutated into this array
 * @param values - The arrays (including the target's value if there is one).
 */
declare function mergeArraysInto<Ts extends ReadonlyArray<ReadonlyArray<unknown>>>(m_target: Reference<unknown[]>, values: Ts): void;
/**
 * The default strategy to merge sets into a target set.
 *
 * @param m_target - The result will be mutated into this set
 * @param values - The sets (including the target's value if there is one).
 */
declare function mergeSetsInto<Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>>(m_target: Reference<Set<unknown>>, values: Ts): void;
/**
 * The default strategy to merge maps into a target map.
 *
 * @param m_target - The result will be mutated into this map
 * @param values - The maps (including the target's value if there is one).
 */
declare function mergeMapsInto<Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>>(m_target: Reference<Map<unknown, unknown>>, values: Ts): void;
/**
 * Set the target to the last non-undefined value.
 */
declare function mergeOthersInto<Ts extends ReadonlyArray<unknown>>(m_target: Reference<unknown>, values: Ts): void;
type MergeIntoFunctions = MergeFunctions;
/**
 * The default merge functions.
 */
type MergeFunctions$0 = {
    mergeRecords: typeof mergeRecords;
    mergeArrays: typeof mergeArrays;
    mergeSets: typeof mergeSets;
    mergeMaps: typeof mergeMaps;
    mergeOthers: typeof mergeOthers;
};
/**
 * The default strategy to merge records.
 *
 * @param values - The records.
 */
declare function mergeRecords<Ts extends ReadonlyArray<Record<PropertyKey, unknown>>, U extends DeepMergeUtils<M, MM>, Fs extends DeepMergeFunctionsURIs, M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData>(values: Ts, utils: U, meta: M | undefined): DeepMergeRecordsDefaultHKT<Ts, Fs, M>;
/**
 * The default strategy to merge arrays.
 *
 * @param values - The arrays.
 */
declare function mergeArrays<Ts extends ReadonlyArray<ReadonlyArray<unknown>>, Fs extends DeepMergeFunctionsURIs, M>(values: Ts): DeepMergeArraysDefaultHKT<Ts, Fs, M>;
/**
 * The default strategy to merge sets.
 *
 * @param values - The sets.
 */
declare function mergeSets<Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>>(values: Ts): DeepMergeSetsDefaultHKT<Ts>;
/**
 * The default strategy to merge maps.
 *
 * @param values - The maps.
 */
declare function mergeMaps<Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>>(values: Ts): DeepMergeMapsDefaultHKT<Ts>;
/**
 * Get the last non-undefined value in the given array.
 */
declare function mergeOthers<Ts extends ReadonlyArray<unknown>>(values: Ts): unknown;
/**
 * The options the user can pass to customize deepmerge.
 */
type DeepMergeOptions<in out M, MM extends Readonly<Record<PropertyKey, unknown>> = {}> = Partial<DeepMergeOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;
/**
 * The options the user can pass to customize deepmergeInto.
 */
type DeepMergeIntoOptions<in out M, MM extends Readonly<Record<PropertyKey, unknown>> = {}> = Partial<DeepMergeIntoOptionsFull<M, MM & DeepMergeBuiltInMetaData>>;
type MetaDataUpdater<in out M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData> = (previousMeta: M | undefined, metaMeta: Readonly<Partial<MM>>) => M;
/**
 * All the options the user can pass to customize deepmerge.
 */
type DeepMergeOptionsFull<in out M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData> = Readonly<{
    mergeRecords: DeepMergeFunctions<M, MM>["mergeRecords"] | false;
    mergeArrays: DeepMergeFunctions<M, MM>["mergeArrays"] | false;
    mergeMaps: DeepMergeFunctions<M, MM>["mergeMaps"] | false;
    mergeSets: DeepMergeFunctions<M, MM>["mergeSets"] | false;
    mergeOthers: DeepMergeFunctions<M, MM>["mergeOthers"];
    metaDataUpdater: MetaDataUpdater<M, MM>;
    enableImplicitDefaultMerging: boolean;
    filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | false;
}>;
/**
 * All the options the user can pass to customize deepmergeInto.
 */
type DeepMergeIntoOptionsFull<in out M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData> = Readonly<{
    mergeRecords: DeepMergeIntoFunctions<M, MM>["mergeRecords"] | false;
    mergeArrays: DeepMergeIntoFunctions<M, MM>["mergeArrays"] | false;
    mergeMaps: DeepMergeIntoFunctions<M, MM>["mergeMaps"] | false;
    mergeSets: DeepMergeIntoFunctions<M, MM>["mergeSets"] | false;
    mergeOthers: DeepMergeIntoFunctions<M, MM>["mergeOthers"];
    metaDataUpdater: MetaDataUpdater<M, MM>;
    filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | false;
}>;
/**
 * An object that has a reference to a value.
 */
type Reference<T> = {
    value: T;
};
/**
 * All the utility functions that can be overridden.
 */
type DeepMergeUtilityFunctions<in M> = Readonly<{
    filterValues: <Ts extends ReadonlyArray<unknown>>(values: Ts, meta: M | undefined) => unknown[];
}>;
/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeFunctions<in M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData> = Readonly<{
    mergeRecords: <Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, U extends DeepMergeUtils<M, MM>>(values: Ts, utils: U, meta: M | undefined) => unknown;
    mergeArrays: <Ts extends ReadonlyArray<ReadonlyArray<unknown>>, U extends DeepMergeUtils<M, MM>>(values: Ts, utils: U, meta: M | undefined) => unknown;
    mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeUtils<M, MM>>(values: Ts, utils: U, meta: M | undefined) => unknown;
    mergeSets: <Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>, U extends DeepMergeUtils<M, MM>>(values: Ts, utils: U, meta: M | undefined) => unknown;
    mergeOthers: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeUtils<M, MM>>(values: Ts, utils: U, meta: M | undefined) => unknown;
}>;
// eslint-disable-next-line ts/no-invalid-void-type
type DeepMergeIntoFunctionsReturnType = void | symbol;
/**
 * All the merge functions that deepmerge uses.
 */
type DeepMergeIntoFunctions<in M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData> = Readonly<{
    mergeRecords: <Ts extends ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, U extends DeepMergeIntoFunctionUtils<M, MM>>(m_target: Reference<Record<PropertyKey, unknown>>, values: Ts, utils: U, meta: M | undefined) => DeepMergeIntoFunctionsReturnType;
    mergeArrays: <Ts extends ReadonlyArray<ReadonlyArray<unknown>>, U extends DeepMergeIntoFunctionUtils<M, MM>>(m_target: Reference<unknown[]>, values: Ts, utils: U, meta: M | undefined) => DeepMergeIntoFunctionsReturnType;
    mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeIntoFunctionUtils<M, MM>>(m_target: Reference<Map<unknown, unknown>>, values: Ts, utils: U, meta: M | undefined) => DeepMergeIntoFunctionsReturnType;
    mergeSets: <Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>, U extends DeepMergeIntoFunctionUtils<M, MM>>(m_target: Reference<Set<unknown>>, values: Ts, utils: U, meta: M | undefined) => DeepMergeIntoFunctionsReturnType;
    mergeOthers: <Ts extends ReadonlyArray<unknown>, U extends DeepMergeIntoFunctionUtils<M, MM>>(m_target: Reference<unknown>, values: Ts, utils: U, meta: M | undefined) => DeepMergeIntoFunctionsReturnType;
}>;
/**
 * The utils provided to the merge functions.
 */
type DeepMergeUtils<in out M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData> = Readonly<{
    mergeFunctions: DeepMergeFunctions<M, MM>;
    defaultMergeFunctions: MergeFunctions$0;
    metaDataUpdater: MetaDataUpdater<M, MM>;
    deepmerge: <Ts extends ReadonlyArray<unknown>>(...values: Ts) => unknown;
    useImplicitDefaultMerging: boolean;
    filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | undefined;
    actions: Readonly<{
        defaultMerge: symbol;
        skip: symbol;
    }>;
}>;
/**
 * The utils provided to the merge functions.
 */
type DeepMergeIntoFunctionUtils<in out M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData> = Readonly<{
    mergeFunctions: DeepMergeIntoFunctions<M, MM>;
    defaultMergeFunctions: MergeIntoFunctions;
    metaDataUpdater: MetaDataUpdater<M, MM>;
    deepmergeInto: <Target extends object, Ts extends ReadonlyArray<unknown>>(target: Target, ...values: Ts) => void;
    filterValues: DeepMergeUtilityFunctions<M>["filterValues"] | undefined;
    actions: Readonly<{
        defaultMerge: symbol;
    }>;
}>;
/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
declare function deepmerge<Ts extends Readonly<ReadonlyArray<unknown>>>(...objects: readonly [
    ...Ts
]): DeepMergeHKT<Ts, DeepMergeFunctionsDefaultURIs, DeepMergeBuiltInMetaData>;
/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
declare function deepmergeCustom<BaseTs = unknown, PMF extends Partial<DeepMergeFunctionsURIs> = {}>(options: DeepMergeOptions<DeepMergeBuiltInMetaData, DeepMergeBuiltInMetaData>): <Ts extends ReadonlyArray<BaseTs>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, DeepMergeBuiltInMetaData>;
/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items' being merged.
 */
declare function deepmergeCustom<BaseTs = unknown, PMF extends Partial<DeepMergeFunctionsURIs> = {}, MetaData = DeepMergeBuiltInMetaData, MetaMetaData extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData>(options: DeepMergeOptions<MetaData, MetaMetaData>, rootMetaData?: MetaData): <Ts extends ReadonlyArray<BaseTs>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData>;
/**
 * Deeply merge objects into a target.
 *
 * @param target - This object will be mutated with the merge result.
 * @param objects - The objects to merge into the target.
 */
declare function deepmergeInto<T extends object>(target: T, ...objects: ReadonlyArray<T>): void;
/**
 * Deeply merge objects into a target.
 *
 * @param target - This object will be mutated with the merge result.
 * @param objects - The objects to merge into the target.
 */
declare function deepmergeInto<Target extends object, Ts extends ReadonlyArray<unknown>>(target: Target, ...objects: Ts): asserts target is SimplifyObject<Target & DeepMergeHKT<[
    Target,
    ...Ts
], DeepMergeFunctionsDefaultURIs, DeepMergeBuiltInMetaData>>;
/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
declare function deepmergeIntoCustom<BaseTs = unknown>(options: DeepMergeIntoOptions<DeepMergeBuiltInMetaData, DeepMergeBuiltInMetaData>): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(target: Target, ...objects: Ts) => void;
/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items' being merged.
 */
declare function deepmergeIntoCustom<BaseTs = unknown, MetaData = DeepMergeBuiltInMetaData, MetaMetaData extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData>(options: DeepMergeIntoOptions<MetaData, MetaMetaData>, rootMetaData?: MetaData): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(target: Target, ...objects: Ts) => void;
/**
 * The different types of objects deepmerge-ts support.
 */
declare const enum ObjectType {
    NOT = 0,
    RECORD = 1,
    ARRAY = 2,
    SET = 3,
    MAP = 4,
    OTHER = 5
}
/**
 * Get the type of the given object.
 *
 * @param object - The object to get the type of.
 * @returns The type of the given object.
 */
declare function getObjectType(object: unknown): ObjectType;
/**
 * Get the keys of the given objects including symbol keys.
 *
 * Note: Only keys to enumerable properties are returned.
 *
 * @param objects - An array of objects to get the keys of.
 * @returns A set containing all the keys of all the given objects.
 */
declare function getKeys(objects: ReadonlyArray<object>): Set<PropertyKey>;
/**
 * Does the given object have the given property.
 *
 * @param object - The object to test.
 * @param property - The property to test.
 * @returns Whether the object has the property.
 */
declare function objectHasProperty(object: object, property: PropertyKey): boolean;
export { deepmerge, deepmergeCustom, deepmergeInto, deepmergeIntoCustom, ObjectType, getKeys, getObjectType, objectHasProperty };
export type { MergeFunctions as DeepMergeIntoFunctionsDefaults, MergeFunctions$0 as DeepMergeFunctionsDefaults, DeepMergeArraysDefaultHKT, DeepMergeBuiltInMetaData, DeepMergeHKT, DeepMergeLeaf, DeepMergeLeafURI, DeepMergeNoFilteringURI, DeepMergeMapsDefaultHKT, DeepMergeFunctionsDefaultURIs, DeepMergeFunctionsURIs, DeepMergeFunctionURItoKind, DeepMergeUtils, DeepMergeIntoFunctionUtils, DeepMergeOptions, DeepMergeIntoOptions, DeepMergeRecordsDefaultHKT, DeepMergeSetsDefaultHKT, Reference as DeepMergeValueReference, GetDeepMergeFunctionsURIs, FilterOut };
