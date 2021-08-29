import type {
  And,
  IsArray,
  IsMap,
  IsNever,
  IsRecord,
  IsSet,
  Or,
} from "./utils";

/**
 * Mapping of merge function URIs to the merge function type.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars-experimental
export interface DeepMergeMergeFunctionURItoKind<
  T1,
  T2,
  MF extends DeepMergeMergeFunctionsURIs
> {}

/**
 * Get the type of the given merge function via its URI.
 */
type DeepMergeMergeFunctionKind<
  URI extends DeepMergeMergeFunctionURIs,
  T1,
  T2,
  MF extends DeepMergeMergeFunctionsURIs
> = DeepMergeMergeFunctionURItoKind<T1, T2, MF>[URI];

/**
 * A union of all valid merge function URIs.
 */
type DeepMergeMergeFunctionURIs = keyof DeepMergeMergeFunctionURItoKind<
  unknown,
  unknown,
  DeepMergeMergeFunctionsURIs
>;

/**
 * The merge functions to use when deep mergeing.
 */
export type DeepMergeMergeFunctionsURIs = {
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
};

/**
 * Deep merge one or more types.
 */
export type DeepMergeHKT<
  Ts extends readonly [unknown, ...unknown[]],
  MF extends DeepMergeMergeFunctionsURIs
> = Ts extends readonly [infer T1, ...unknown[]]
  ? Ts extends readonly [T1, infer T2, ...infer TRest]
    ? TRest extends Readonly<ReadonlyArray<never>>
      ? MergeHKT<T1, T2, MF>
      : MergeHKT<T1, DeepMergeHKT<[T2, ...TRest], MF>, MF>
    : T1
  : never;

/**
 * Merge the two types.
 */
type MergeHKT<T1, T2, MF extends DeepMergeMergeFunctionsURIs> = Or<
  IsNever<T1>,
  IsNever<T2>
> extends true
  ? Leaf<T1, T2>
  : DeepMergeUnknownsHKT<T1, T2, MF>;

/**
 * Get the leaf type from 2 types that can't be merged.
 */
export type Leaf<T1, T2> = IsNever<T2> extends true ? T1 : T2;

/**
 * Deep merge two types.
 */
export type DeepMergeUnknownsHKT<
  T1,
  T2,
  MF extends DeepMergeMergeFunctionsURIs
> = And<IsArray<T1>, IsArray<T2>> extends true
  ? DeepMergeArraysHKT<T1, T2, MF>
  : And<IsMap<T1>, IsMap<T2>> extends true
  ? DeepMergeMapsHKT<T1, T2, MF>
  : And<IsSet<T1>, IsSet<T2>> extends true
  ? DeepMergeSetsHKT<T1, T2, MF>
  : And<IsRecord<T1>, IsRecord<T2>> extends true
  ? DeepMergeRecordsHKT<T1, T2, MF>
  : DeepMergeOthersHKT<T1, T2, MF>;

/**
 * Deep merge two records.
 */
// prettier-ignore
type DeepMergeRecordsHKT<T1, T2, MF extends DeepMergeMergeFunctionsURIs> =
  DeepMergeMergeFunctionKind<MF["DeepMergeRecordsURI"], T1, T2, MF>;

/**
 * Deep merge two arrays.
 */
// prettier-ignore
type DeepMergeArraysHKT<T1, T2, MF extends DeepMergeMergeFunctionsURIs> =
  DeepMergeMergeFunctionKind<MF["DeepMergeArraysURI"], T1, T2, MF>;

/**
 * Deep merge two sets.
 */
// prettier-ignore
type DeepMergeSetsHKT<T1, T2, MF extends DeepMergeMergeFunctionsURIs> =
  DeepMergeMergeFunctionKind<MF["DeepMergeSetsURI"], T1, T2, MF>;

/**
 * Deep merge two maps.
 */
// prettier-ignore
type DeepMergeMapsHKT<T1, T2, MF extends DeepMergeMergeFunctionsURIs> =
  DeepMergeMergeFunctionKind<MF["DeepMergeMapsURI"], T1, T2, MF>;

/**
 * Deep merge two other things.
 */
// prettier-ignore
type DeepMergeOthersHKT<T1, T2, MF extends DeepMergeMergeFunctionsURIs> =
  DeepMergeMergeFunctionKind<MF["DeepMergeOthersURI"], T1, T2, MF>;
