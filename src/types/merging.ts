import type {
  DeepMergeArraysDefaultHKT,
  DeepMergeCircularReferencesDefaultHKT,
  DeepMergeFilterValuesDefaultHKT,
  DeepMergeFilterValuesDefaultURI,
  DeepMergeFunctionsDefaultURIs,
  DeepMergeMapsDefaultHKT,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
} from "./defaults.ts";
import type {
  And,
  AssertType,
  Is,
  IsArray,
  IsMap,
  IsNever,
  IsRecord,
  IsSet,
  IsTuple,
  IsUnion,
  Not,
  TupleTupleToTupleUnion,
  UnionToTuple,
} from "./utils.ts";

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
  readonly DeepMergeCircularReferencesURI: DeepMergeCircularReferencesDefaultHKT<Ts, Fs, M>;
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
      : DeepMergeSameTypeShortcut<Ts, Fs> extends true
        ? DeepMergeSameTypeElement<Ts>
        : DeepMergeHKTHelper<FilterValuesHKT<Ts, Fs, M>, Fs, M>
    : unknown;

type DeepMergeHKTHelper<Ts, Fs extends DeepMergeFunctionsURIs, M> =
  Ts extends ReadonlyArray<unknown>
    ? IsTuple<Ts> extends true
      ? Ts extends readonly []
        ? unknown
        : Ts extends readonly [infer T1]
          ? T1
          : DeepMergeDispatch<Ts, Fs, M, DeepMergeTupleKind<Ts>>
      : unknown
    : never;

/**
 * Returns whether or not all the given types can be deep merged by simply
 * returning the first type as-is.
 *
 * When every value being merged has the same type and that type is sound to
 * shortcut (see {@link DeepMergeSameTypeShortcutElement}), the result is that
 * same type, so the full recursive computation can be skipped for that common
 * case.
 */
type DeepMergeSameTypeShortcut<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs> =
  Is<Fs, DeepMergeFunctionsDefaultURIs> extends true
    ? AllSameTypes<Ts> extends true
      ? Ts extends readonly [infer T1, ...ReadonlyArray<unknown>]
        ? DeepMergeSameTypeShortcutElement<T1> extends true
          ? true
          : false
        : false
      : false
    : false;

/**
 * Returns whether or not an element type is eligible for the same-type
 * shortcut.
 *
 * A type is eligible when merging two values of that type is guaranteed to
 * produce exactly that type (see {@link DeepMergeSameTypeValueSound}).
 */
type DeepMergeSameTypeShortcutElement<T1> = DeepMergeSameTypeValueSound<T1, []> extends true ? true : false;

/**
 * Returns whether or not the given type is sound to shortcut, meaning merging
 * two values of this type is guaranteed to produce exactly this type.
 *
 * A type is unsound (and therefore excluded from the shortcut) when:
 * - it is a union (merging two union values can produce a value outside the union, and `undefined`
 * members are filtered out by default), or
 * - it contains `undefined` (filtered out by default), or
 * - it is a readonly array or a tuple (arrays are concatenated, so the readonly/width information
 * would be lost), or
 * - it is a readonly `Set`/`Map` (they are merged into mutable versions), or
 * - it is a record that contains any readonly property or any unsound value (records are merged
 * key-by-key, so `Readonly`/`Partial` wrappers are stripped from the result), or
 * - it is part of a cycle of records (to keep the check terminating; the full merge handles
 * recursive types correctly).
 *
 * `Seen` accumulates the records already visited so that recursive types are
 * reported as unsound instead of causing a circular reference error.
 */
type DeepMergeSameTypeValueSound<V, Seen extends ReadonlyArray<unknown>> = [V] extends [Seen[number]]
  ? false
  : IsUnion<V> extends true
    ? false
    : undefined extends V
      ? false
      : V extends ReadonlyArray<unknown>
        ? V extends unknown[]
          ? Not<IsTuple<V>>
          : false
        : V extends ReadonlySet<unknown>
          ? V extends Set<unknown>
            ? true
            : false
          : V extends ReadonlyMap<unknown, unknown>
            ? V extends Map<unknown, unknown>
              ? true
              : false
            : V extends Readonly<Record<PropertyKey, unknown>>
              ? DeepMergeSameTypeRecordSound<V, [V, ...Seen]>
              : true;

/**
 * Returns whether or not every property of the given record is sound to
 * shortcut (see {@link DeepMergeSameTypeValueSound}).
 *
 * `Readonly` properties are always unsound because the full merge strips the
 * `readonly` modifier from the result.
 */
type DeepMergeSameTypeRecordSound<T, Seen extends ReadonlyArray<unknown>> = {
  [K in keyof T]-?: IsReadonlyProperty<T, K> extends true
    ? K
    : DeepMergeSameTypeValueSound<Required<T>[K], Seen> extends true
      ? never
      : K;
}[keyof T] extends never
  ? true
  : false;

/**
 * Returns whether or not the given property is readonly.
 *
 * This relies on TypeScript's identity check between a mutable and a readonly
 * mapped type and correctly reports `false` for optional properties.
 */
type IsReadonlyProperty<T, K extends keyof T> =
  // eslint-disable-next-line ts/consistent-indexed-object-style -- `Record<K, T[K]>` does not reliably distinguish readonly modifiers
  (<P>() => P extends { [PK in K]: T[K] } ? 1 : 2) extends <P>() => P extends { readonly [PK in K]: T[K] } ? 1 : 2
    ? true
    : false;

/**
 * Get the first element of a non-empty tuple.
 */
type DeepMergeSameTypeElement<Ts extends ReadonlyArray<unknown>> = Ts extends readonly [
  infer T1,
  ...ReadonlyArray<unknown>,
]
  ? T1
  : never;

/**
 * Returns whether or not all the given types are the same type
 * (mutually assignable).
 */
type AllSameTypes<Ts extends ReadonlyArray<unknown>> = Ts extends readonly [infer Head, ...infer Rest]
  ? Rest extends ReadonlyArray<unknown>
    ? RestIsSameAs<Rest, Head>
    : true
  : true;

/**
 * Returns whether or not every type in the tuple is the same type as the
 * given type (mutually assignable).
 */
type RestIsSameAs<Ts extends ReadonlyArray<unknown>, T> = Ts extends readonly [infer Head, ...infer Rest]
  ? And<Is<Head, T>, Is<T, Head>> extends true
    ? Rest extends ReadonlyArray<unknown>
      ? RestIsSameAs<Rest, T>
      : true
    : false
  : true;

type DeepMergeDispatch<
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  M,
  Kind,
> = Kind extends "array"
  ? DeepMergeArraysHKT<Ts, Fs, M>
  : Kind extends "map"
    ? DeepMergeMapsHKT<Ts, Fs, M>
    : Kind extends "set"
      ? DeepMergeSetsHKT<Ts, Fs, M>
      : Kind extends "record"
        ? DeepMergeRecordsHKT<Ts, Fs, M>
        : DeepMergeOthersHKT<Ts, Fs, M>;

type DeepMergeElementKind<T> =
  IsArray<T> extends true
    ? "array"
    : IsMap<T> extends true
      ? "map"
      : IsSet<T> extends true
        ? "set"
        : IsRecord<T> extends true
          ? "record"
          : "other";

type DeepMergeTupleKind<Ts extends ReadonlyArray<unknown>> =
  DeepMergeKinds<Ts> extends "array"
    ? "array"
    : DeepMergeKinds<Ts> extends "map"
      ? "map"
      : DeepMergeKinds<Ts> extends "set"
        ? "set"
        : DeepMergeKinds<Ts> extends "record"
          ? "record"
          : "other";

type DeepMergeKinds<Ts extends ReadonlyArray<unknown>> = { [I in keyof Ts]: DeepMergeElementKind<Ts[I]> }[number];

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
                    [I in keyof Ts]: DeepMergeLeafElement<Ts[I], Fs, M>;
                  }
                >
              >
            >
          >
      : never;

type DeepMergeLeafElement<E, Fs extends DeepMergeFunctionsURIs, M> = undefined extends E
  ? FilterValuesHKT<UnionToTuple<E>, Fs, M>
  : Fs["DeepMergeFilterValuesURI"] extends DeepMergeFilterValuesDefaultURI
    ? [E]
    : FilterValuesHKT<UnionToTuple<E>, Fs, M>;

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
 * A level in the merge hierarchy.
 */
export type HierarchyValue = Readonly<{
  key: unknown;
  parents: ReadonlyArray<unknown>;
  values: ReadonlyArray<unknown>;
  result: unknown;
}>;

/**
 * The root metadata type.
 */
export type DeepMergeRootMetaData = undefined;

/**
 * The built-in metadata type used by deepmerge.
 */
export type DeepMergeBuiltInMetaData =
  | DeepMergeRootMetaData
  | (Partial<DeepMergeMergeInfo> &
      Readonly<{
        hierarchy?: ReadonlyArray<HierarchyValue>;
      }>);

/**
 * The metadata type used by deepmerge.
 */
export type DeepMergeMetaData = unknown;

/**
 * Information about a single merge step, passed to {@link MetaDataUpdater}.
 *
 * - `key` — the property key being merged (e.g. a `Record` property name,
 * an array index for arrays, or `undefined` for the top-level merge).
 * - `parents` — the input values (in their original positions) that are
 * being merged at this step. For `deepmergeInto` these include the
 * target's value at index 0.
 * - `values` — the candidate values for `key` extracted from `parents`.
 * - `result` — the partial merge result computed so far for this step.
 */
export type DeepMergeMergeInfo = Readonly<{
  key: unknown;
  parents: ReadonlyArray<unknown>;
  values: ReadonlyArray<unknown>;
  result: unknown;
}>;
