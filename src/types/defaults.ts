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
  Ts extends Readonly<ReadonlyArray<unknown>>,
  MF extends DeepMergeMergeFunctionsURIs
> = Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>
  ? FlatternAlias<
      Omit<
        DeepMergeRecordsDefaultHKTInternalProps<Ts, MF>,
        BlacklistedRecordProps
      >
    >
  : {};

/**
 * Deep merge record props.
 */
type DeepMergeRecordsDefaultHKTInternalProps<
  Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>,
  MF extends DeepMergeMergeFunctionsURIs
> = {
  [K in OptionalKeysOf<Ts>]?: DeepMergeHKT<
    DeepMergeRecordsDefaultHKTInternalPropValue<Ts, K>,
    MF
  >;
} & {
  [K in RequiredKeysOf<Ts>]: DeepMergeHKT<
    DeepMergeRecordsDefaultHKTInternalPropValue<Ts, K>,
    MF
  >;
};

/**
 * Get the value of the property.
 */
type DeepMergeRecordsDefaultHKTInternalPropValue<
  Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>,
  K extends PropertyKey
> = FilterOutNever<
  DeepMergeRecordsDefaultHKTInternalPropValueHelper<
    Ts,
    K,
    Readonly<readonly []>
  >
>;

/**
 * Tail-recursive helper type for DeepMergeRecordsDefaultHKTInternalPropValue.
 */
type DeepMergeRecordsDefaultHKTInternalPropValueHelper<
  Ts extends Readonly<readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]>,
  K extends PropertyKey,
  Acc extends Readonly<ReadonlyArray<unknown>>
> = Ts extends Readonly<readonly [infer Head, ...infer Rest]>
  ? Head extends Record<PropertyKey, unknown>
    ? Rest extends Readonly<
        readonly [unknown, ...Readonly<ReadonlyArray<unknown>>]
      >
      ? DeepMergeRecordsDefaultHKTInternalPropValueHelper<
          Rest,
          K,
          [...Acc, ValueOfKey<Head, K>]
        >
      : [...Acc, ValueOfKey<Head, K>]
    : never
  : never;

/**
 * Deep merge 2 arrays.
 */
export type DeepMergeArraysDefaultHKT<
  Ts extends Readonly<ReadonlyArray<unknown>>,
  MF extends DeepMergeMergeFunctionsURIs
> = DeepMergeArraysDefaultHKTHelper<Ts, MF, []>;

/**
 * Tail-recursive helper type for DeepMergeArraysDefaultHKT.
 */
type DeepMergeArraysDefaultHKTHelper<
  Ts extends Readonly<ReadonlyArray<unknown>>,
  MF extends DeepMergeMergeFunctionsURIs,
  Acc extends Readonly<ReadonlyArray<unknown>>
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Readonly<ReadonlyArray<unknown>>
    ? Rest extends readonly [
        Readonly<ReadonlyArray<unknown>>,
        ...Readonly<ReadonlyArray<Readonly<ReadonlyArray<unknown>>>>
      ]
      ? DeepMergeArraysDefaultHKTHelper<Rest, MF, [...Acc, ...Head]>
      : [...Acc, ...Head]
    : never
  : never;

/**
 * Deep merge 2 sets.
 */
export type DeepMergeSetsDefaultHKT<
  Ts extends Readonly<ReadonlyArray<unknown>>,
  MF extends DeepMergeMergeFunctionsURIs
> = Set<UnionSetValues<Ts>>;

/**
 * Deep merge 2 maps.
 */
export type DeepMergeMapsDefaultHKT<
  Ts extends Readonly<ReadonlyArray<unknown>>,
  MF extends DeepMergeMergeFunctionsURIs
> = Map<UnionMapKeys<Ts>, UnionMapValues<Ts>>;

/**
 * Get the merge functions with defaults apply from the given subset.
 */
export type GetDeepMergeMergeFunctionsURIs<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>
> = Readonly<{
  // prettier-ignore
  DeepMergeRecordsURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeRecordsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any>
      ? PMF["DeepMergeRecordsURI"]
      : DeepMergeRecordsDefaultURI;

  // prettier-ignore
  DeepMergeArraysURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeArraysURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any>
      ? PMF["DeepMergeArraysURI"]
      : DeepMergeArraysDefaultURI;

  // prettier-ignore
  DeepMergeSetsURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeSetsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any>
      ? PMF["DeepMergeSetsURI"]
      : DeepMergeSetsDefaultURI;

  // prettier-ignore
  DeepMergeMapsURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeMapsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any>
      ? PMF["DeepMergeMapsURI"]
      : DeepMergeMapsDefaultURI;

  // prettier-ignore
  DeepMergeOthersURI:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PMF["DeepMergeOthersURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any>
      ? PMF["DeepMergeOthersURI"]
      : DeepMergeLeafURI;
}>;
