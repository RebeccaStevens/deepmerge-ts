import type {
  DeepMergeArraysDefaultHKT,
  DeepMergeFilterValuesDefaultHKT,
  DeepMergeMapsDefaultHKT,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
} from "./defaults";
import type {
  AssertType,
  EveryIsArray,
  EveryIsMap,
  EveryIsRecord,
  EveryIsSet,
  IsNever,
  IsTuple,
  TupleTupleToTupleUnion,
  UnionToTuple,
} from "./utils";

/**
 * Mapping of merge function URIs to the merge function type.
 */
// eslint-disable-next-line ts/consistent-type-definitions
export interface DeepMergeFunctionURItoKind<
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  in out M,
> {
  readonly DeepMergeLeafURI: DeepMergeLeaf<Ts, Fs, M>;
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
type DeepMergeFunctionKind<
  URI extends DeepMergeFunctionURIs,
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionURItoKind<Ts, Fs, M>[URI];

/**
 * A union of all valid merge function URIs.
 */
type DeepMergeFunctionURIs = keyof DeepMergeFunctionURItoKind<ReadonlyArray<unknown>, DeepMergeFunctionsURIs, unknown>;

/**
 * The merge functions to use when deep merging.
 */
export type DeepMergeFunctionsURIs = Readonly<{
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
export type DeepMergeHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> =
  IsTuple<Ts> extends true
    ? Ts extends readonly []
      ? undefined
      : DeepMergeHKTHelper<FilterValuesHKT<Ts, Fs, M>, Fs, M>
    : unknown;

type DeepMergeHKTHelper<Ts, Fs extends DeepMergeFunctionsURIs, M> =
  Ts extends ReadonlyArray<unknown>
    ? IsTuple<Ts> extends true
      ? Ts extends readonly []
        ? unknown
        : Ts extends readonly [infer T1]
          ? T1
          : EveryIsArray<Ts> extends true
            ? DeepMergeArraysHKT<Ts, Fs, M>
            : EveryIsMap<Ts> extends true
              ? DeepMergeMapsHKT<Ts, Fs, M>
              : EveryIsSet<Ts> extends true
                ? DeepMergeSetsHKT<Ts, Fs, M>
                : EveryIsRecord<Ts> extends true
                  ? DeepMergeRecordsHKT<Ts, Fs, M>
                  : DeepMergeOthersHKT<Ts, Fs, M>
      : unknown
    : never;

/**
 * Deep merge records.
 */
type DeepMergeRecordsHKT<
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionKind<Fs["DeepMergeRecordsURI"], Ts, Fs, M>;

/**
 * Deep merge arrays.
 */
type DeepMergeArraysHKT<
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionKind<Fs["DeepMergeArraysURI"], Ts, Fs, M>;

/**
 * Deep merge sets.
 */
type DeepMergeSetsHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionKind<
  Fs["DeepMergeSetsURI"],
  Ts,
  Fs,
  M
>;

/**
 * Deep merge maps.
 */
type DeepMergeMapsHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionKind<
  Fs["DeepMergeMapsURI"],
  Ts,
  Fs,
  M
>;

/**
 * Deep merge other things.
 */
type DeepMergeOthersHKT<
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionKind<Fs["DeepMergeOthersURI"], Ts, Fs, M>;

/**
 * Filter values.
 */
type FilterValuesHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = DeepMergeFunctionKind<
  Fs["DeepMergeFilterValuesURI"],
  Ts,
  Fs,
  M
>;

/**
 * The merge function that returns a leaf.
 */
export type DeepMergeLeafURI = "DeepMergeLeafURI";

/**
 * Don't filter values.
 */
export type DeepMergeNoFilteringURI = "DeepMergeNoFilteringURI";

/**
 * Get the leaf type from many types that can't be merged.
 */
export type DeepMergeLeaf<
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  M,
> = Ts extends readonly []
  ? never
  : Ts extends readonly [infer T]
    ? T
    : Ts extends readonly [...infer Rest, infer Tail]
      ? IsNever<Tail> extends true
        ? Rest extends ReadonlyArray<unknown>
          ? DeepMergeLeaf<Rest, Fs, M>
          : never
        : DeepMergeLeafApplyFilter<
            Ts,
            AssertType<
              ReadonlyArray<unknown>,
              TupleTupleToTupleUnion<
                AssertType<
                  ReadonlyArray<ReadonlyArray<unknown>>,
                  {
                    [I in keyof Ts]: FilterValuesHKT<UnionToTuple<Ts[I]>, Fs, M>;
                  }
                >
              >
            >
          >
      : never;

type DeepMergeLeafApplyFilter<
  Original extends ReadonlyArray<unknown>,
  Filtered extends ReadonlyArray<unknown>,
> = Original extends readonly [...infer OriginalRest, infer OriginalTail]
  ? Filtered extends readonly [...infer FilteredRest, infer FilteredTail]
    ? OriginalTail extends FilteredTail
      ? FilteredTail
      : FilteredTail | DeepMergeLeafApplyFilter<OriginalRest, FilteredRest>
    : never
  : never;

/**
 * The meta data deepmerge is able to provide.
 */
export type DeepMergeBuiltInMetaData = Readonly<{
  key: PropertyKey;
  parents: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>;
}>;
