/**
 * Simplify a complex type such as a union or intersection of objects into a
 * single object.
 */
export type SimplifyObject<T extends {}> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Flatten a collection of tuples of tuples into a collection of tuples.
 */
export type FlattenTuples<T> = {
  [I in keyof T]: FlattenTuple<T[I]>;
};

/**
 * Flatten a tuple of tuples into a single tuple.
 */
export type FlattenTuple<T> = T extends readonly []
  ? []
  : T extends readonly [infer T0]
    ? [...FlattenTuple<T0>]
    : T extends readonly [infer T0, ...infer Ts]
      ? [...FlattenTuple<T0>, ...FlattenTuple<Ts>]
      : [T];

/**
 * Safely test whether or not the first given types extends the second.
 *
 * Needed in particular for testing if a type is "never".
 */
export type Is<T1, T2> = [T1] extends [T2] ? true : false;

/**
 * Safely test whether or not the given type is "never".
 */
export type IsNever<T> = Is<T, never>;

/**
 * And operator for types.
 */
export type And<T1 extends boolean, T2 extends boolean> = T1 extends false
  ? false
  : T2;

/**
 * Or operator for types.
 */
export type Or<T1 extends boolean, T2 extends boolean> = T1 extends true
  ? true
  : T2;

/**
 * Not operator for types.
 */
export type Not<T extends boolean> = T extends true ? false : true;

/**
 * Returns whether or not all the given types are never.
 */
export type EveryIsNever<Ts extends ReadonlyArray<unknown>> =
  Ts extends readonly [infer Head, ...infer Rest]
    ? IsNever<Head> extends true
      ? Rest extends ReadonlyArray<unknown>
        ? EveryIsNever<Rest>
        : true
      : false
    : true;

/**
 * Returns whether or not the given type a record.
 */
export type IsRecord<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<Record<PropertyKey, unknown>> ? true : false
>;

/**
 * Returns whether or not all the given types are records.
 */
export type EveryIsRecord<Ts extends ReadonlyArray<unknown>> =
  Ts extends readonly [infer Head, ...infer Rest]
    ? IsRecord<Head> extends true
      ? Rest extends ReadonlyArray<unknown>
        ? EveryIsRecord<Rest>
        : true
      : false
    : true;

/**
 * Returns whether or not the given type is an array.
 */
export type IsArray<T> = And<
  Not<IsNever<T>>,
  T extends ReadonlyArray<unknown> ? true : false
>;

/**
 * Returns whether or not all the given types are arrays.
 */
export type EveryIsArray<Ts extends ReadonlyArray<unknown>> =
  Ts extends readonly [infer T1]
    ? IsArray<T1>
    : Ts extends readonly [infer Head, ...infer Rest]
      ? IsArray<Head> extends true
        ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>]
          ? EveryIsArray<Rest>
          : false
        : false
      : false;

/**
 * Returns whether or not the given type is an set.
 *
 * Note: This may also return true for Maps.
 */
export type IsSet<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<ReadonlySet<unknown>> ? true : false
>;

/**
 * Returns whether or not all the given types are sets.
 *
 * Note: This may also return true if all are maps.
 */
export type EveryIsSet<Ts extends ReadonlyArray<unknown>> =
  Ts extends Readonly<readonly [infer T1]>
    ? IsSet<T1>
    : Ts extends readonly [infer Head, ...infer Rest]
      ? IsSet<Head> extends true
        ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>]
          ? EveryIsSet<Rest>
          : false
        : false
      : false;

/**
 * Returns whether or not the given type is an map.
 */
export type IsMap<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<ReadonlyMap<unknown, unknown>> ? true : false
>;

/**
 * Returns whether or not all the given types are maps.
 */
export type EveryIsMap<Ts extends ReadonlyArray<unknown>> =
  Ts extends Readonly<readonly [infer T1]>
    ? IsMap<T1>
    : Ts extends readonly [infer Head, ...infer Rest]
      ? IsMap<Head> extends true
        ? Rest extends readonly [unknown, ...ReadonlyArray<unknown>]
          ? EveryIsMap<Rest>
          : false
        : false
      : false;

/**
 * Union of the sets' values' types
 */
export type UnionSetValues<Ts extends ReadonlyArray<unknown>> =
  UnionSetValuesHelper<Ts, never>;

/**
 * Tail-recursive helper type for UnionSetValues.
 */
type UnionSetValuesHelper<
  Ts extends ReadonlyArray<unknown>,
  Acc,
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Readonly<ReadonlySet<infer V1>>
    ? Rest extends ReadonlyArray<unknown>
      ? UnionSetValuesHelper<Rest, Acc | V1>
      : Acc | V1
    : never
  : Acc;

/**
 * Union of the maps' values' types
 */
export type UnionMapKeys<Ts extends ReadonlyArray<unknown>> =
  UnionMapKeysHelper<Ts, never>;

/**
 * Tail-recursive helper type for UnionMapKeys.
 */
type UnionMapKeysHelper<
  Ts extends ReadonlyArray<unknown>,
  Acc,
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Readonly<ReadonlyMap<infer K1, unknown>>
    ? Rest extends readonly []
      ? Acc | K1
      : UnionMapKeysHelper<Rest, Acc | K1>
    : never
  : Acc;

/**
 * Union of the maps' keys' types
 */
export type UnionMapValues<Ts extends ReadonlyArray<unknown>> =
  UnionMapValuesHelper<Ts, never>;

/**
 * Tail-recursive helper type for UnionMapValues.
 */
type UnionMapValuesHelper<
  Ts extends ReadonlyArray<unknown>,
  Acc,
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Readonly<ReadonlyMap<unknown, infer V1>>
    ? Rest extends readonly []
      ? Acc | V1
      : UnionMapValuesHelper<Rest, Acc | V1>
    : never
  : Acc;

/**
 * Filter out nevers from a tuple.
 */
export type FilterOutNever<T> =
  T extends ReadonlyArray<unknown> ? FilterOutNeverHelper<T, []> : never;

/**
 * Tail-recursive helper type for FilterOutNever.
 */
type FilterOutNeverHelper<
  T extends ReadonlyArray<unknown>,
  Acc extends ReadonlyArray<unknown>,
> = T extends readonly []
  ? Acc
  : T extends readonly [infer Head, ...infer Rest]
    ? IsNever<Head> extends true
      ? FilterOutNeverHelper<Rest, Acc>
      : FilterOutNeverHelper<Rest, [...Acc, Head]>
    : T;

/**
 * Is the type a tuple?
 */
export type IsTuple<T extends ReadonlyArray<unknown>> = T extends readonly []
  ? true
  : T extends readonly [unknown, ...ReadonlyArray<unknown>]
    ? true
    : false;

/**
 * Perfrom a transpose operation on a 2D tuple.
 */
export type TransposeTuple<T> = T extends readonly [
  ...(readonly [...unknown[]]),
]
  ? T extends readonly []
    ? []
    : T extends readonly [infer X extends ReadonlyArray<unknown>]
      ? TransposeTupleSimpleCase<X>
      : T extends readonly [
            infer X extends ReadonlyArray<unknown>,
            ...infer XS extends ReadonlyArray<ReadonlyArray<unknown>>,
          ]
        ? PrependCol<X, TransposeTuple<XS>>
        : T
  : never;

type PrependCol<
  T extends ReadonlyArray<unknown>,
  S extends ReadonlyArray<ReadonlyArray<unknown>>,
> = T extends readonly []
  ? S extends readonly []
    ? []
    : never
  : T extends readonly [infer X, ...infer XS]
    ? S extends readonly [
        readonly [...infer Y],
        ...infer YS extends ReadonlyArray<ReadonlyArray<unknown>>,
      ]
      ? [[X, ...Y], ...PrependCol<XS, YS>]
      : never
    : never;

type TransposeTupleSimpleCase<T extends readonly [...unknown[]]> =
  T extends readonly []
    ? []
    : T extends readonly [infer X, ...infer XS]
      ? [[X], ...TransposeTupleSimpleCase<XS>]
      : never;

/**
 * Convert a tuple to an intersection of each of its types.
 */
export type TupleToIntersection<T extends ReadonlyArray<unknown>> =
  {
    [K in keyof T]: (x: T[K]) => void;
  } extends Record<number, (x: infer I) => void>
    ? I
    : never;

/**
 * Convert a union to a tuple.
 *
 * Warning: The order of the elements is non-deterministic.
 * Warning 2: The union maybe me modified by the TypeScript engine before convertion.
 * Warning 3: This implementation relies on a hack/limitation in TypeScript.
 */
export type TuplifyUnion<T, L = LastOf<T>> =
  IsNever<T> extends true ? [] : [...TuplifyUnion<Exclude<T, L>>, L];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never;
