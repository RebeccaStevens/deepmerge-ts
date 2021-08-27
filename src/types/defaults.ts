import type {
  Leaf,
  DeepMergeUnknownsHKT,
  DeepMergeMergeFunctionsURIs,
  DeepMergeMergeFunctionURItoKind,
} from "./mergeing";
import type { FlatternAlias, IsNever, Or, ValueOfKey } from "./utils";

declare module "./mergeing" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DeepMergeMergeFunctionURItoKind<
    T1,
    T2,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    readonly DeepMergeRecordsDefaultURI: DeepMergeRecordsDefaultHKT<T1, T2, MF>;
    readonly DeepMergeArraysDefaultURI: DeepMergeArraysDefaultHKT<T1, T2, MF>;
    readonly DeepMergeSetsDefaultURI: DeepMergeSetsDefaultHKT<T1, T2, MF>;
    readonly DeepMergeMapsDefaultURI: DeepMergeMapsDefaultHKT<T1, T2, MF>;
    readonly DeepMergeOthersDefaultURI: DeepMergeOthersDefaultHKT<T1, T2, MF>;
  }
}

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
 * The default merge function to merge other things with.
 */
type DeepMergeOthersDefaultURI = "DeepMergeOthersDefaultURI";

/**
 * The default merge functions to use when deep mergeing.
 */
export type DeepMergeMergeFunctionsDefaultURIs = {
  DeepMergeRecordsURI: DeepMergeRecordsDefaultURI;
  DeepMergeArraysURI: DeepMergeArraysDefaultURI;
  DeepMergeSetsURI: DeepMergeSetsDefaultURI;
  DeepMergeMapsURI: DeepMergeMapsDefaultURI;
  DeepMergeOthersURI: DeepMergeOthersDefaultURI;
};

/**
 * A union of all the props that should not be included in type information for
 * merged records.
 */
type BlacklistedRecordProps = "__proto__";

/**
 * Deep merge 2 non-array objects.
 */
export type DeepMergeRecordsDefaultHKT<
  T1,
  T2,
  MF extends DeepMergeMergeFunctionsURIs
> = FlatternAlias<
  Omit<
    // prettier-ignore
    {
      -readonly [K in keyof T1]: DeepMergeRecordPropsDefaultHKT<
        ValueOfKey<T1, K>,
        ValueOfKey<T2, K>,
        MF
      >;
    } &
    {
      -readonly [K in keyof T2]: DeepMergeRecordPropsDefaultHKT<
        ValueOfKey<T1, K>,
        ValueOfKey<T2, K>,
        MF
      >;
    },
    BlacklistedRecordProps
  >
>;

/**
 * Deep merge 2 types that are known to be properties of an object being deeply
 * merged.
 */
type DeepMergeRecordPropsDefaultHKT<
  T1,
  T2,
  MF extends DeepMergeMergeFunctionsURIs
> = Or<IsNever<T1>, IsNever<T2>> extends true
  ? Leaf<T1, T2>
  : DeepMergeUnknownsHKT<T1, T2, MF>;

/**
 * Deep merge 2 arrays.
 */
export type DeepMergeArraysDefaultHKT<
  T1,
  T2,
  MF extends DeepMergeMergeFunctionsURIs
> = T1 extends readonly [...infer E1]
  ? T2 extends readonly [...infer E2]
    ? [...E1, ...E2]
    : never
  : never;

/**
 * Deep merge 2 sets.
 */
export type DeepMergeSetsDefaultHKT<
  T1,
  T2,
  MF extends DeepMergeMergeFunctionsURIs
> = T1 extends Set<infer E1>
  ? T2 extends Set<infer E2>
    ? Set<E1 | E2>
    : never
  : never;

/**
 * Deep merge 2 maps.
 */
export type DeepMergeMapsDefaultHKT<
  T1,
  T2,
  MF extends DeepMergeMergeFunctionsURIs
> = T1 extends Map<infer K1, infer V1>
  ? T2 extends Map<infer K2, infer V2>
    ? Map<K1 | K2, V1 | V2>
    : never
  : never;

/**
 * Deep merge other things.
 */
export type DeepMergeOthersDefaultHKT<
  T1,
  T2,
  MF extends DeepMergeMergeFunctionsURIs
> = Leaf<T1, T2>;

/**
 * Get the merge functions with defaults apply from the given subset.
 */
export type GetDeepMergeMergeFunctionsURIs<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>
> = {
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
      : DeepMergeOthersDefaultURI;
};
