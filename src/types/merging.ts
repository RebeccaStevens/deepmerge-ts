import {
  type DeepMergeArraysDefaultHKT,
  type DeepMergeFilterValuesDefaultHKT,
  type DeepMergeMapsDefaultHKT,
  type DeepMergeRecordsDefaultHKT,
  type DeepMergeSetsDefaultHKT,
} from "./defaults";
import {
  type EveryIsArray,
  type EveryIsMap,
  type EveryIsRecord,
  type EveryIsSet,
  type IsNever,
  type IsTuple,
} from "./utils";

/**
 * Mapping of merge function URIs to the merge function type.
 */
// eslint-disable-next-line ts/consistent-type-definitions
export interface DeepMergeFunctionURItoKind<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeFunctionsURIs,
  in out M,
> {
  readonly DeepMergeLeafURI: DeepMergeLeaf<Ts>;
  readonly DeepMergeRecordsDefaultURI: DeepMergeRecordsDefaultHKT<Ts, MF, M>;
  readonly DeepMergeArraysDefaultURI: DeepMergeArraysDefaultHKT<Ts, MF, M>;
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
  MF extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionURItoKind<Ts, MF, M>[URI];

/**
 * A union of all valid merge function URIs.
 */
type DeepMergeFunctionURIs = keyof DeepMergeFunctionURItoKind<
  ReadonlyArray<unknown>,
  DeepMergeFunctionsURIs,
  unknown
>;

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
export type DeepMergeHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeFunctionsURIs,
  M,
> =
  IsTuple<Ts> extends true
    ? Ts extends readonly []
      ? undefined
      : DeepMergeHKTHelper<FilterValuesHKT<Ts, MF, M>, MF, M>
    : unknown;

type DeepMergeHKTHelper<Ts, MF extends DeepMergeFunctionsURIs, M> =
  Ts extends ReadonlyArray<unknown>
    ? IsTuple<Ts> extends true
      ? Ts extends readonly []
        ? unknown
        : Ts extends readonly [infer T1]
          ? T1
          : EveryIsArray<Ts> extends true
            ? DeepMergeArraysHKT<Ts, MF, M>
            : EveryIsMap<Ts> extends true
              ? DeepMergeMapsHKT<Ts, MF, M>
              : EveryIsSet<Ts> extends true
                ? DeepMergeSetsHKT<Ts, MF, M>
                : EveryIsRecord<Ts> extends true
                  ? DeepMergeRecordsHKT<Ts, MF, M>
                  : DeepMergeOthersHKT<Ts, MF, M>
      : unknown
    : never;

/**
 * Deep merge records.
 */
type DeepMergeRecordsHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionKind<MF["DeepMergeRecordsURI"], Ts, MF, M>;

/**
 * Deep merge arrays.
 */
type DeepMergeArraysHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionKind<MF["DeepMergeArraysURI"], Ts, MF, M>;

/**
 * Deep merge sets.
 */
type DeepMergeSetsHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionKind<MF["DeepMergeSetsURI"], Ts, MF, M>;

/**
 * Deep merge maps.
 */
type DeepMergeMapsHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionKind<MF["DeepMergeMapsURI"], Ts, MF, M>;

/**
 * Deep merge other things.
 */
type DeepMergeOthersHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionKind<MF["DeepMergeOthersURI"], Ts, MF, M>;

/**
 * Filter values.
 */
type FilterValuesHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeFunctionKind<MF["DeepMergeFilterValuesURI"], Ts, MF, M>;

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
export type DeepMergeLeaf<Ts extends ReadonlyArray<unknown>> =
  Ts extends readonly []
    ? never
    : Ts extends readonly [infer T]
      ? T
      : Ts extends readonly [...infer Rest, infer Tail]
        ? IsNever<Tail> extends true
          ? Rest extends ReadonlyArray<unknown>
            ? DeepMergeLeaf<Rest>
            : never
          : Tail
        : never;

/**
 * The meta data deepmerge is able to provide.
 */
export type DeepMergeBuiltInMetaData = Readonly<{
  key: PropertyKey;
  parents: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>;
}>;
