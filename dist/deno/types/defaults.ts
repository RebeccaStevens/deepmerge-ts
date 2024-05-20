import {
  type DeepMergeHKT,
  type DeepMergeLeafURI,
  type DeepMergeMergeFunctionURItoKind,
  type DeepMergeMergeFunctionsURIs,
} from "./merging.ts";
import {
  type FilterOutNever,
  type FlattenTuples,
  type KeyIsOptional,
  type SimplifyObject,
  type TransposeTuple,
  type TupleToIntersection,
  type TuplifyUnion,
  type UnionMapKeys,
  type UnionMapValues,
  type UnionSetValues,
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
 * The default merge functions to use when deep merging.
 */
export type DeepMergeMergeFunctionsDefaultURIs = Readonly<{
  DeepMergeRecordsURI: DeepMergeRecordsDefaultURI;
  DeepMergeArraysURI: DeepMergeArraysDefaultURI;
  DeepMergeSetsURI: DeepMergeSetsDefaultURI;
  DeepMergeMapsURI: DeepMergeMapsDefaultURI;
  DeepMergeOthersURI: DeepMergeLeafURI;
}>;

type RecordEntries<T extends Record<PropertyKey, unknown>> = TuplifyUnion<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;

type RecordMeta = Record<PropertyKey, RecordPropertyMeta>;

type RecordPropertyMeta<
  Key extends PropertyKey = PropertyKey,
  Value = unknown,
  Optional extends boolean = boolean,
> = {
  key: Key;
  value: Value;
  optional: Optional;
};

type RecordsToRecordMeta<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
> = {
  [I in keyof Ts]: RecordToRecordMeta<Ts[I]>;
};

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
export type DeepMergeRecordsDefaultHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs,
  M,
> =
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>
    ? SimplifyObject<
        DeepMergeRecordMetaDefaultHKTProps<RecordsToRecordMeta<Ts>, MF, M>
      >
    : never;

/**
 * Deep merge record props.
 */
type DeepMergeRecordMetaDefaultHKTProps<
  RecordMetas extends ReadonlyArray<RecordMeta>,
  MF extends DeepMergeMergeFunctionsURIs,
  M,
> = CreateRecordFromMeta<MergeRecordMeta<RecordMetas>, MF, M>;

type MergeRecordMeta<RecordMetas extends ReadonlyArray<RecordMeta>> =
  GroupValuesByKey<
    FlattenTuples<
      TransposeTuple<{
        [I in keyof RecordMetas]: TransposeTuple<RecordEntries<RecordMetas[I]>>;
      }>
    >
  >;

type GroupValuesByKey<Ts> = Ts extends readonly [
  infer Keys extends ReadonlyArray<PropertyKey>,
  infer Values,
]
  ? {
      [I in keyof Keys]: DeepMergeRecordPropertyMetaDefaultHKTGetPossible<
        Keys[I],
        FilterOutNever<{
          [J in keyof Values]: Values[J] extends {
            key: Keys[I];
          }
            ? Values[J]
            : never;
        }>
      >;
    }
  : never;

type CreateRecordFromMeta<Ts, MF extends DeepMergeMergeFunctionsURIs, M> =
  Ts extends ReadonlyArray<unknown>
    ? TupleToIntersection<{
        [I in keyof Ts]: Ts[I] extends {
          key: infer Key extends PropertyKey;
          values: infer Values extends ReadonlyArray<unknown>;
          optional: infer O extends boolean;
        }
          ? CreateRecordForKeyFromMeta<Key, Values, O, MF, M>
          : never;
      }>
    : never;

type CreateRecordForKeyFromMeta<
  Key extends PropertyKey,
  Values extends ReadonlyArray<unknown>,
  Optional extends boolean,
  MF extends DeepMergeMergeFunctionsURIs,
  M,
> = Optional extends true
  ? {
      [k in Key]+?: DeepMergeHKT<Values, MF, M>;
    }
  : {
      [k in Key]-?: DeepMergeHKT<Values, MF, M>;
    };

/**
 * Get the possible types of a property.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetPossible<
  Key extends PropertyKey,
  Ts,
> = Ts extends readonly [
  RecordPropertyMeta,
  ...ReadonlyArray<RecordPropertyMeta>,
]
  ? DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<
      Ts,
      { key: Key; values: []; optional: never }
    >
  : never;

/**
 * Tail-recursive helper type for DeepMergeRecordPropertyMetaDefaultHKTGetPossible.
 */
type DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<
  Ts extends readonly [
    RecordPropertyMeta,
    ...ReadonlyArray<RecordPropertyMeta>,
  ],
  Acc extends {
    key: PropertyKey;
    values: ReadonlyArray<unknown>;
    optional: boolean;
  },
> = Ts extends [
  ...infer Rest,
  {
    key: infer K extends PropertyKey;
    value: infer V;
    optional: infer O extends boolean;
  },
]
  ? Acc["optional"] extends true
    ? Acc extends { values: [infer Head, ...infer AccRest] }
      ? Rest extends readonly [
          RecordPropertyMeta,
          ...ReadonlyArray<RecordPropertyMeta>,
        ]
        ? DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<
            Rest,
            {
              key: K;
              values: [V | Head, ...AccRest];
              optional: O;
            }
          >
        : {
            key: K;
            values: [V | Head, ...AccRest];
            optional: O;
          }
      : Rest extends readonly [
            RecordPropertyMeta,
            ...ReadonlyArray<RecordPropertyMeta>,
          ]
        ? DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<
            Rest,
            {
              key: K;
              values: [V, ...Acc["values"]];
              optional: O;
            }
          >
        : {
            key: K;
            values: [V, ...Acc["values"]];
            optional: O;
          }
    : Rest extends readonly [
          RecordPropertyMeta,
          ...ReadonlyArray<RecordPropertyMeta>,
        ]
      ? DeepMergeRecordPropertyMetaDefaultHKTGetPossibleHelper<
          Rest,
          {
            key: K;
            values: [V, ...Acc["values"]];
            optional: O;
          }
        >
      : {
          key: K;
          values: [V, ...Acc["values"]];
          optional: O;
        }
  : never;

/**
 * Deep merge arrays.
 */
export type DeepMergeArraysDefaultHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs,
  M,
> = DeepMergeArraysDefaultHKTHelper<Ts, MF, M, []>;

/**
 * Tail-recursive helper type for DeepMergeArraysDefaultHKT.
 */
type DeepMergeArraysDefaultHKTHelper<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs,
  M,
  Acc extends ReadonlyArray<unknown>,
> = Ts extends readonly [
  infer Head extends ReadonlyArray<unknown>,
  ...infer Rest,
]
  ? Rest extends readonly [
      ReadonlyArray<unknown>,
      ...ReadonlyArray<ReadonlyArray<unknown>>,
    ]
    ? DeepMergeArraysDefaultHKTHelper<Rest, MF, M, [...Acc, ...Head]>
    : [...Acc, ...Head]
  : never;

/**
 * Deep merge sets.
 */
export type DeepMergeSetsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Set<
  UnionSetValues<Ts>
>;

/**
 * Deep merge maps.
 */
export type DeepMergeMapsDefaultHKT<Ts extends ReadonlyArray<unknown>> = Map<
  UnionMapKeys<Ts>,
  UnionMapValues<Ts>
>;

/**
 * Get the merge functions with defaults apply from the given subset.
 */
export type GetDeepMergeMergeFunctionsURIs<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>,
> = Readonly<{
  // prettier-ignore
  DeepMergeRecordsURI:
    PMF["DeepMergeRecordsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeRecordsURI"]
      : DeepMergeRecordsDefaultURI;

  // prettier-ignore
  DeepMergeArraysURI:
    PMF["DeepMergeArraysURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeArraysURI"]
      : DeepMergeArraysDefaultURI;

  // prettier-ignore
  DeepMergeSetsURI:
    PMF["DeepMergeSetsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeSetsURI"]
      : DeepMergeSetsDefaultURI;

  // prettier-ignore
  DeepMergeMapsURI:
    PMF["DeepMergeMapsURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeMapsURI"]
      : DeepMergeMapsDefaultURI;

  // prettier-ignore
  DeepMergeOthersURI:
    PMF["DeepMergeOthersURI"] extends keyof DeepMergeMergeFunctionURItoKind<any, any, any>
      ? PMF["DeepMergeOthersURI"]
      : DeepMergeLeafURI;
}>;
