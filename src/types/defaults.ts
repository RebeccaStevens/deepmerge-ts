import type {
  DeepMergeFunctionURItoKind,
  DeepMergeFunctionsURIs,
  DeepMergeHKT,
  DeepMergeLeaf,
  DeepMergeLeafURI,
} from "./merging.ts";
import type {
  FilterOut,
  Is,
  IsNever,
  KeyIsOptional,
  PreciseOrUnion,
  SimplifyObject,
  UnionMapKeys,
  UnionMapValues,
  UnionSetValues,
} from "./utils.ts";

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
export type DeepMergeFilterValuesDefaultURI = "DeepMergeFilterValuesDefaultURI";

/**
 * The default merge functions to use when deep merging.
 */
export type DeepMergeFunctionsDefaultURIs = Readonly<{
  DeepMergeRecordsURI: DeepMergeRecordsDefaultURI;
  DeepMergeArraysURI: DeepMergeArraysDefaultURI;
  DeepMergeSetsURI: DeepMergeSetsDefaultURI;
  DeepMergeMapsURI: DeepMergeMapsDefaultURI;
  DeepMergeOthersURI: DeepMergeLeafURI;
  DeepMergeFilterValuesURI: DeepMergeFilterValuesDefaultURI;
}>;

type KnownKeys<T> = keyof {
  [K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: any;
};

type RecordPropertyMeta<Key extends PropertyKey = PropertyKey, Value = unknown, Optional extends boolean = boolean> = {
  key: Key;
  value: Value;
  optional: Optional;
};

/**
 * Deep merge records.
 */
export type DeepMergeRecordsDefaultHKT<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> =
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>
    ? IsNever<RecordKeysOf<Ts>> extends true
      ? never
      : SimplifyObject<DeepMergeRecordProps<Ts, Fs, M>>
    : never;

type DeepMergeRecordProps<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> = {
  [K in RequiredKeysOf<Ts>]: DeepMergeHKT<ValuesForKey<K, Ts>, Fs, M>;
} & {
  [K in OptionalKeysOf<Ts>]?: DeepMergeHKT<ValuesForKey<K, Ts>, Fs, M>;
};

type RequiredKeysOf<Ts extends ReadonlyArray<unknown>> = {
  [K in RecordKeysOf<Ts>]: OptionalForKey<K, Ts> extends true ? never : K;
}[RecordKeysOf<Ts>];

type OptionalKeysOf<Ts extends ReadonlyArray<unknown>> = {
  [K in RecordKeysOf<Ts>]: OptionalForKey<K, Ts> extends true ? K : never;
}[RecordKeysOf<Ts>];

type RecordKeysOf<Ts extends ReadonlyArray<unknown>> = {
  [I in keyof Ts]: RecordKeys<Ts[I]>;
}[number];

type RecordKeys<T> = IsNever<KnownKeys<T>> extends true ? keyof T : KnownKeys<T>;

type ValuesForKey<K extends PropertyKey, Ts extends ReadonlyArray<unknown>> =
  DeepMergeRecordPropertyMetaDefaultHKTHasOptionalOfKey<K, Ts> extends true
    ? DeepMergeRecordPropertyMetaDefaultHKTGetPossible<K, PresentMetasOfKey<K, Ts>>["values"]
    : DeepMergeRecordPropertyMetaDefaultHKTGetValuesNoOptionalOfKey<K, Ts>;

type OptionalForKey<
  K extends PropertyKey,
  Ts extends ReadonlyArray<unknown>,
> = DeepMergeRecordPropertyMetaDefaultHKTGetOptionalOfKey<K, Ts>;

/**
 * Get the tuple of present values of a property directly from the inputs,
 * which is what the metas fold produces when no value is optional.
 *
 * This is the hot path and avoids building the per-input metas.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetValuesNoOptionalOfKey<
  K extends PropertyKey,
  Ts extends ReadonlyArray<unknown>,
> = Ts extends readonly [infer Head, ...infer Rest]
  ? K extends keyof Head
    ? Rest extends ReadonlyArray<unknown>
      ? [Required<Head>[K], ...DeepMergeRecordPropertyMetaDefaultHKTGetValuesNoOptionalOfKey<K, Rest>]
      : [Required<Head>[K]]
    : Rest extends ReadonlyArray<unknown>
      ? DeepMergeRecordPropertyMetaDefaultHKTGetValuesNoOptionalOfKey<K, Rest>
      : []
  : [];

/**
 * Returns whether or not any of the inputs has the given property optional.
 */
type DeepMergeRecordPropertyMetaDefaultHKTHasOptionalOfKey<
  K extends PropertyKey,
  Ts extends ReadonlyArray<unknown>,
> = Ts extends readonly [infer Head, ...infer Rest]
  ? K extends keyof Head
    ? KeyIsOptional<K, Head> extends true
      ? true
      : Rest extends ReadonlyArray<unknown>
        ? DeepMergeRecordPropertyMetaDefaultHKTHasOptionalOfKey<K, Rest>
        : false
    : Rest extends ReadonlyArray<unknown>
      ? DeepMergeRecordPropertyMetaDefaultHKTHasOptionalOfKey<K, Rest>
      : false
  : false;

/**
 * Get the optionality of a property, which is determined by the optionality
 * of the first input that has it.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetOptionalOfKey<
  K extends PropertyKey,
  Ts extends ReadonlyArray<unknown>,
> = Ts extends readonly [infer Head, ...infer Rest]
  ? K extends keyof Head
    ? KeyIsOptional<K, Head>
    : Rest extends ReadonlyArray<unknown>
      ? DeepMergeRecordPropertyMetaDefaultHKTGetOptionalOfKey<K, Rest>
      : never
  : never;

type MetaOfKey<R, K extends PropertyKey> = K extends keyof R
  ? { key: K; value: Required<R>[K]; optional: KeyIsOptional<K, R> }
  : never;

type PresentMetasOfKey<K extends PropertyKey, Ts extends ReadonlyArray<unknown>> = Ts extends readonly [
  infer Head,
  ...infer Rest,
]
  ? K extends keyof Head
    ? Rest extends ReadonlyArray<unknown>
      ? [MetaOfKey<Head, K>, ...PresentMetasOfKey<K, Rest>]
      : [MetaOfKey<Head, K>]
    : Rest extends ReadonlyArray<unknown>
      ? PresentMetasOfKey<K, Rest>
      : []
  : [];

/**
 * Get the possible types of a property.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetPossible<Key extends PropertyKey, Ts> = Ts extends readonly [
  RecordPropertyMeta,
  ...ReadonlyArray<RecordPropertyMeta>,
]
  ? {
      key: Key;
      values: DeepMergeRecordPropertyMetaDefaultHKTGetValues<Ts>;
      optional: DeepMergeRecordPropertyMetaDefaultHKTGetOptional<Ts>;
    }
  : never;

/**
 * Get the tuple of possible values of a property.
 *
 * When no meta is optional the fold used by the full helper would only ever
 * prepend values, which is the same as extracting them directly, so that
 * cheaper path is taken to reduce type-level work for the common case.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetValues<
  Ts extends readonly [RecordPropertyMeta, ...ReadonlyArray<RecordPropertyMeta>],
> =
  DeepMergeRecordPropertyMetaDefaultHKTHasOptional<Ts> extends true
    ? DeepMergeRecordPropertyMetaDefaultHKTGetValuesHelper<Ts, [], false>
    : DeepMergeRecordPropertyMetaDefaultHKTGetValuesNoOptional<Ts>;

/**
 * Get the tuple of values when none of the metas are optional, which is the
 * common case and avoids the fold entirely.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetValuesNoOptional<
  Ts extends readonly [RecordPropertyMeta, ...ReadonlyArray<RecordPropertyMeta>],
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Rest extends readonly [RecordPropertyMeta, ...ReadonlyArray<RecordPropertyMeta>]
    ? [Head extends { value: infer V } ? V : never, ...DeepMergeRecordPropertyMetaDefaultHKTGetValuesNoOptional<Rest>]
    : [Head extends { value: infer V } ? V : never]
  : never;

/**
 * Returns whether or not any of the given property metas is optional.
 */
type DeepMergeRecordPropertyMetaDefaultHKTHasOptional<
  Ts extends readonly [RecordPropertyMeta, ...ReadonlyArray<RecordPropertyMeta>],
> = {
  [I in keyof Ts]: Ts[I] extends { optional: true } ? true : false;
}[number] extends false
  ? false
  : true;

/**
 * Tail-recursive helper type for DeepMergeRecordPropertyMetaDefaultHKTGetValues.
 *
 * Values are folded from last to first. When the previously folded meta was
 * optional the current value is merged into the head of the accumulated tuple
 * via `PreciseOrUnion`.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetValuesHelper<
  Ts extends readonly [RecordPropertyMeta, ...ReadonlyArray<RecordPropertyMeta>],
  Acc extends ReadonlyArray<unknown>,
  AccOptional extends boolean,
> = Ts extends [...infer Rest, { value: infer V; optional: infer O extends boolean }]
  ? AccOptional extends true
    ? Acc extends readonly [infer Head, ...infer AccRest]
      ? Rest extends readonly [RecordPropertyMeta, ...ReadonlyArray<RecordPropertyMeta>]
        ? DeepMergeRecordPropertyMetaDefaultHKTGetValuesHelper<Rest, [PreciseOrUnion<V, Head>, ...AccRest], O>
        : [PreciseOrUnion<V, Head>, ...AccRest]
      : Rest extends readonly [RecordPropertyMeta, ...ReadonlyArray<RecordPropertyMeta>]
        ? DeepMergeRecordPropertyMetaDefaultHKTGetValuesHelper<Rest, [V, ...Acc], O>
        : [V, ...Acc]
    : Rest extends readonly [RecordPropertyMeta, ...ReadonlyArray<RecordPropertyMeta>]
      ? DeepMergeRecordPropertyMetaDefaultHKTGetValuesHelper<Rest, [V, ...Acc], O>
      : [V, ...Acc]
  : never;

/**
 * Get whether or not a property is optional, which is determined by the
 * optionality of the first value present.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetOptional<
  Ts extends readonly [RecordPropertyMeta, ...ReadonlyArray<RecordPropertyMeta>],
> = Ts extends readonly [infer First, ...ReadonlyArray<RecordPropertyMeta>]
  ? First extends { optional: infer O extends boolean }
    ? O
    : never
  : never;

/**
 * Deep merge arrays.
 */
export type DeepMergeArraysDefaultHKT<
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeArraysDefaultHKTHelper<Ts, Fs, M, []>;

/**
 * Tail-recursive helper type for DeepMergeArraysDefaultHKT.
 */
type DeepMergeArraysDefaultHKTHelper<
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  M,
  Acc extends ReadonlyArray<unknown>,
> = Ts extends readonly [infer Head extends ReadonlyArray<unknown>, ...infer Rest]
  ? Rest extends readonly [ReadonlyArray<unknown>, ...ReadonlyArray<ReadonlyArray<unknown>>]
    ? DeepMergeArraysDefaultHKTHelper<Rest, Fs, M, [...Acc, ...Head]>
    : [...Acc, ...Head]
  : never;

/**
 * Deep merge sets.
 */
export type DeepMergeSetsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Set<UnionSetValues<Ts>>;

/**
 * Deep merge maps.
 */
export type DeepMergeMapsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Map<UnionMapKeys<Ts>, UnionMapValues<Ts>>;

/**
 * Filter out undefined values.
 */
export type DeepMergeFilterValuesDefaultHKT<Ts extends ReadonlyArray<unknown>> =
  DeepMergeFilterValuesShortcut<Ts> extends true ? Ts : FilterOut<Ts, undefined>;

type DeepMergeFilterValuesShortcut<Ts extends ReadonlyArray<unknown>> = {
  [I in keyof Ts]: Is<Ts[I], undefined>;
}[number] extends false
  ? true
  : false;

/**
 * Get the merge functions with defaults apply from the given subset.
 */
export type GetDeepMergeFunctionsURIs<PMF extends Partial<DeepMergeFunctionsURIs>> = Readonly<{
  DeepMergeRecordsURI: PMF["DeepMergeRecordsURI"] extends keyof DeepMergeFunctionURItoKind<
    ReadonlyArray<unknown>,
    DeepMergeFunctionsURIs,
    unknown
  >
    ? PMF["DeepMergeRecordsURI"]
    : DeepMergeRecordsDefaultURI;

  DeepMergeArraysURI: PMF["DeepMergeArraysURI"] extends keyof DeepMergeFunctionURItoKind<
    ReadonlyArray<unknown>,
    DeepMergeFunctionsURIs,
    unknown
  >
    ? PMF["DeepMergeArraysURI"]
    : DeepMergeArraysDefaultURI;

  DeepMergeSetsURI: PMF["DeepMergeSetsURI"] extends keyof DeepMergeFunctionURItoKind<
    ReadonlyArray<unknown>,
    DeepMergeFunctionsURIs,
    unknown
  >
    ? PMF["DeepMergeSetsURI"]
    : DeepMergeSetsDefaultURI;

  DeepMergeMapsURI: PMF["DeepMergeMapsURI"] extends keyof DeepMergeFunctionURItoKind<
    ReadonlyArray<unknown>,
    DeepMergeFunctionsURIs,
    unknown
  >
    ? PMF["DeepMergeMapsURI"]
    : DeepMergeMapsDefaultURI;

  DeepMergeOthersURI: PMF["DeepMergeOthersURI"] extends keyof DeepMergeFunctionURItoKind<
    ReadonlyArray<unknown>,
    DeepMergeFunctionsURIs,
    unknown
  >
    ? PMF["DeepMergeOthersURI"]
    : DeepMergeLeafURI;

  DeepMergeFilterValuesURI: PMF["DeepMergeFilterValuesURI"] extends keyof DeepMergeFunctionURItoKind<
    ReadonlyArray<unknown>,
    DeepMergeFunctionsURIs,
    unknown
  >
    ? PMF["DeepMergeFilterValuesURI"]
    : DeepMergeFilterValuesDefaultURI;
}>;

/**
 * Deep merge circular references.
 */
export type DeepMergeCircularReferencesDefaultHKT<
  Ts extends ReadonlyArray<unknown>,
  Fs extends DeepMergeFunctionsURIs,
  M,
> = DeepMergeLeaf<Ts, Fs, M>;
