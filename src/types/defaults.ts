import type {
  DeepMergeHKT,
  DeepMergeLeafURI,
  DeepMergeMergeFunctionsURIs,
  DeepMergeMergeFunctionURItoKind,
} from "./merging";
import type {
  FlatternAlias,
  FilterOutNever,
  OptionalKeysOf,
  RequiredKeysOf,
  UnionMapKeys,
  UnionMapValues,
  UnionSetValues,
  ValueOfKey,
} from "./utils";

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
 * The default merge functions to use when deep merging.
 */
export type DeepMergeMergeFunctionsDefaultURIs = Readonly<{
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
type BlacklistedRecordProps = "__proto__";

/**
 * Deep merge records.
 */
export type DeepMergeRecordsDefaultHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs,
  M
> = Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>
  ? FlatternAlias<
      Omit<
        DeepMergeRecordsDefaultHKTInternalProps<Ts, MF, M>,
        BlacklistedRecordProps
      >
    >
  : {};

/**
 * Deep merge record props.
 */
type DeepMergeRecordsDefaultHKTInternalProps<
  Ts extends readonly [unknown, ...ReadonlyArray<unknown>],
  MF extends DeepMergeMergeFunctionsURIs,
  M
> = {
  [K in OptionalKeysOf<Ts>]?: DeepMergeHKT<
    DeepMergeRecordsDefaultHKTInternalPropValue<Ts, K, M>,
    MF,
    M
  >;
} & {
  [K in RequiredKeysOf<Ts>]: DeepMergeHKT<
    DeepMergeRecordsDefaultHKTInternalPropValue<Ts, K, M>,
    MF,
    M
  >;
};

/**
 * Get the value of the property.
 */
type DeepMergeRecordsDefaultHKTInternalPropValue<
  Ts extends readonly [unknown, ...ReadonlyArray<unknown>],
  K extends PropertyKey,
  M
> = FilterOutNever<
  DeepMergeRecordsDefaultHKTInternalPropValueHelper<Ts, K, M, readonly []>
>;

/**
 * Tail-recursive helper type for DeepMergeRecordsDefaultHKTInternalPropValue.
 */
type DeepMergeRecordsDefaultHKTInternalPropValueHelper<
  Ts extends readonly [unknown, ...ReadonlyArray<unknown>],
  K extends PropertyKey,
  M,
  Acc extends ReadonlyArray<unknown>
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Readonly<Record<PropertyKey, unknown>>
    ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>]
      ? DeepMergeRecordsDefaultHKTInternalPropValueHelper<
          Rest,
          K,
          M,
          [...Acc, ValueOfKey<Head, K>]
        >
      : [...Acc, ValueOfKey<Head, K>]
    : never
  : never;

/**
 * Deep merge 2 arrays.
 */
export type DeepMergeArraysDefaultHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs,
  M
> = DeepMergeArraysDefaultHKTHelper<Ts, MF, M, []>;

/**
 * Tail-recursive helper type for DeepMergeArraysDefaultHKT.
 */
type DeepMergeArraysDefaultHKTHelper<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs,
  M,
  Acc extends ReadonlyArray<unknown>
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends ReadonlyArray<unknown>
    ? Rest extends readonly [
        ReadonlyArray<unknown>,
        ...ReadonlyArray<ReadonlyArray<unknown>>
      ]
      ? DeepMergeArraysDefaultHKTHelper<Rest, MF, M, [...Acc, ...Head]>
      : [...Acc, ...Head]
    : never
  : never;

/**
 * Deep merge 2 sets.
 */
export type DeepMergeSetsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Set<
  UnionSetValues<Ts>
>;

/**
 * Deep merge 2 maps.
 */
export type DeepMergeMapsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Map<
  UnionMapKeys<Ts>,
  UnionMapValues<Ts>
>;

/**
 * Get the merge functions with defaults apply from the given subset.
 */
export type GetDeepMergeMergeFunctionsURIs<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>
> = Readonly<{
  // prettier-ignore
  DeepMergeRecordsURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeRecordsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeRecordsURI"]
      : DeepMergeRecordsDefaultURI;

  // prettier-ignore
  DeepMergeArraysURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeArraysURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeArraysURI"]
      : DeepMergeArraysDefaultURI;

  // prettier-ignore
  DeepMergeSetsURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeSetsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeSetsURI"]
      : DeepMergeSetsDefaultURI;

  // prettier-ignore
  DeepMergeMapsURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeMapsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeMapsURI"]
      : DeepMergeMapsDefaultURI;

  // prettier-ignore
  DeepMergeOthersURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeOthersURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeOthersURI"]
      : DeepMergeLeafURI;
}>;
