import type { Kind2, URIS2 } from "fp-ts/HKT";

declare module "fp-ts/HKT" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface URItoKind2<E, A> {
    readonly DeepMergeDefaultHKT: DeepMergeUnknowns<E, A>;
  }
}

/**
 * Deep merge 1 or more types given in an array.
 */
export type DeepMerge<
  Ts extends readonly [unknown, ...unknown[]],
  URI extends URIS2
> = Ts extends readonly [infer T1, ...unknown[]]
  ? Ts extends readonly [T1, infer T2, ...infer TRest]
    ? TRest extends Readonly<ReadonlyArray<never>>
      ? MergeOrLeafHKT<T1, T2, URI>
      : MergeOrLeafHKT<T1, DeepMerge<[T2, ...TRest], URI>, URI>
    : T1
  : never;

/**
 * The options the user can pass to customize deepmerge.
 */
export type DeepMergeOptions = Partial<DeepMergeOptionsFull>;

/**
 * All the options the user can pass to customize deepmerge.
 */
export type DeepMergeOptionsFull = Readonly<{
  mergeMaps: <
    T1 extends Readonly<ReadonlyMap<unknown, unknown>>,
    T2 extends Readonly<ReadonlyMap<unknown, unknown>>,
    U extends DeepMergeUtils
  >(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;
  mergeSets: <
    T1 extends Readonly<ReadonlySet<unknown>>,
    T2 extends Readonly<ReadonlySet<unknown>>,
    U extends DeepMergeUtils
  >(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;
  mergeArrays: <
    T1 extends Readonly<ReadonlyArray<unknown>>,
    T2 extends Readonly<ReadonlyArray<unknown>>,
    U extends DeepMergeUtils
  >(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;
  mergeRecords: <
    T1 extends Readonly<Record<Property, unknown>>,
    T2 extends Readonly<Record<Property, unknown>>,
    U extends DeepMergeUtils
  >(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;
  mergeOthers: <T1, T2, U extends DeepMergeUtils>(
    x: T1,
    y: T2,
    utils: U
  ) => unknown;
}>;

/**
 * The utils provided to the merge functions.
 */
export type DeepMergeUtils = DeepMergeOptionsFull &
  Readonly<{
    deepmerge: <T1, T2>(x: T1, y: T2) => unknown;
  }>;

/**
 * Merge the two types is they exists with the given HKT merge method, otherwise
 * get a Leaf.
 */
type MergeOrLeafHKT<T1, T2, URI extends URIS2> = Or<
  IsNever<T1>,
  IsNever<T2>
> extends true
  ? Leaf<T1, T2>
  : Kind2<URI, T1, T2>;

/**
 * The URI for DeepMergeDefaultHKT.
 */
export type DeepMergeDefaultURI = "DeepMergeDefaultHKT";

/**
 * Deep merge 2 types.
 */
export type DeepMergeUnknowns<T1, T2> = And<
  IsArray<T1>,
  IsArray<T2>
> extends true
  ? DeepMergeArrays<T1, T2>
  : And<IsMap<T1>, IsMap<T2>> extends true
  ? DeepMergeMaps<T1, T2>
  : And<IsSet<T1>, IsSet<T2>> extends true
  ? DeepMergeSets<T1, T2>
  : And<IsRecord<T1>, IsRecord<T2>> extends true
  ? DeepMergeRecords<T1, T2>
  : Leaf<T1, T2>;

/**
 * A union of all the props that should not be included in type information for
 * merged records.
 */
type BlacklistedRecordProps = "__proto__";

/**
 * Deep merge 2 non-array objects.
 */
export type DeepMergeRecords<T1, T2> = FlatternAlias<
  Omit<
    // prettier-ignore
    {
      -readonly [K in keyof T1]: DeepMergeRecordProps<
        ValueOfKey<T1, K>,
        ValueOfKey<T2, K>
      >;
    } &
    {
      -readonly [K in keyof T2]: DeepMergeRecordProps<
        ValueOfKey<T1, K>,
        ValueOfKey<T2, K>
      >;
    },
    BlacklistedRecordProps
  >
>;

/**
 * Deep merge 2 types that are known to be properties of an object being deeply
 * merged.
 */
type DeepMergeRecordProps<T1, T2> = Or<IsNever<T1>, IsNever<T2>> extends true
  ? Leaf<T1, T2>
  : DeepMergeUnknowns<T1, T2>;

/**
 * Deep merge 2 arrays.
 */
export type DeepMergeArrays<T1, T2> = T1 extends readonly [...infer E1]
  ? T2 extends readonly [...infer E2]
    ? [...E1, ...E2]
    : never
  : never;

/**
 * Deep merge 2 sets.
 */
export type DeepMergeSets<T1, T2> = T1 extends Set<infer E1>
  ? T2 extends Set<infer E2>
    ? Set<E1 | E2>
    : never
  : never;

/**
 * Deep merge 2 maps.
 */
export type DeepMergeMaps<T1, T2> = T1 extends Map<infer K1, infer V1>
  ? T2 extends Map<infer K2, infer V2>
    ? Map<K1 | K2, V1 | V2>
    : never
  : never;

/**
 * Get the leaf type from 2 types that can't be merged.
 */
type Leaf<T1, T2> = IsNever<T2> extends true ? T1 : T2;

/**
 * Flatten a complex type such as a union or intersection of objects into a
 * single object.
 */
type FlatternAlias<T> = { [P in keyof T]: T[P] } & {};

/**
 * Get the value of the given key in the given object.
 */
type ValueOfKey<T, K> = K extends keyof T ? T[K] : never;

/**
 * Safely test whether or not the first given types extends the second.
 *
 * Needed in particular for testing if a type is "never".
 */
type Is<T1, T2> = [T1] extends [T2] ? true : false;

/**
 * Safely test whether or not the given type is "never".
 */
type IsNever<T> = Is<T, never>;

/**
 * Returns whether or not the given type a record.
 */
type IsRecord<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<Record<Property, unknown>> ? true : false
>;

/**
 * Returns whether or not the given type is an array.
 */
type IsArray<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<ReadonlyArray<unknown>> ? true : false
>;

/**
 * Returns whether or not the given type is an set.
 *
 * Note: This may also return true for Maps.
 */
type IsSet<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<ReadonlySet<unknown>> ? true : false
>;

/**
 * Returns whether or not the given type is an map.
 */
type IsMap<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<ReadonlyMap<unknown, unknown>> ? true : false
>;

/**
 * And operator for types.
 */
type And<T1 extends boolean, T2 extends boolean> = T1 extends false
  ? false
  : T2;

/**
 * Or operator for types.
 */
type Or<T1 extends boolean, T2 extends boolean> = T1 extends true ? true : T2;

/**
 * Not operator for types.
 */
type Not<T extends boolean> = T extends true ? false : true;

/**
 * A property that can index an object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Property = keyof any;
