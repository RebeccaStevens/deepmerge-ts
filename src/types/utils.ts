/**
 * Flatten a complex type such as a union or intersection of objects into a
 * single object.
 */
export type FlatternAlias<T> = { [P in keyof T]: T[P] } & {};

/**
 * Get the value of the given key in the given object.
 */
export type ValueOfKey<
  T extends Record<PropertyKey, unknown>,
  K extends PropertyKey
> = K extends keyof T ? T[K] : never;

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
 * Returns whether or not all the given types are never.
 */
export type EveryIsNever<Ts extends ReadonlyArray<unknown>> = Ts extends [
  infer Head,
  ...infer Rest
]
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
export type EveryIsRecord<Ts extends ReadonlyArray<unknown>> = Ts extends [
  infer Head,
  ...infer Rest
]
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
export type EveryIsArray<Ts extends ReadonlyArray<unknown>> = Ts extends [
  infer T1
]
  ? IsArray<T1>
  : Ts extends [infer Head, ...infer Rest]
  ? IsArray<Head> extends true
    ? Rest extends [unknown, ...ReadonlyArray<unknown>]
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
export type EveryIsSet<Ts extends ReadonlyArray<unknown>> = Ts extends [
  infer T1
]
  ? IsSet<T1>
  : Ts extends [infer Head, ...infer Rest]
  ? IsSet<Head> extends true
    ? Rest extends [unknown, ...ReadonlyArray<unknown>]
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
export type EveryIsMap<Ts extends ReadonlyArray<unknown>> = Ts extends [
  infer T1
]
  ? IsMap<T1>
  : Ts extends [infer Head, ...infer Rest]
  ? IsMap<Head> extends true
    ? Rest extends [unknown, ...ReadonlyArray<unknown>]
      ? EveryIsMap<Rest>
      : false
    : false
  : false;

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
 * Union of the sets' values' types
 */
export type UnionSetValues<Ts extends ReadonlyArray<unknown>> =
  UnionSetValuesHelper<Ts, never>;

/**
 * Tail-recursive helper type for UnionSetValues.
 */
type UnionSetValuesHelper<
  Ts extends ReadonlyArray<unknown>,
  Acc
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Set<infer V1>
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
  Acc
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Map<infer K1, unknown>
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
  Acc
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Map<unknown, infer V1>
    ? Rest extends readonly []
      ? Acc | V1
      : UnionMapValuesHelper<Rest, Acc | V1>
    : never
  : Acc;

/**
 * Get all the keys of the given records.
 */
export type KeysOf<Ts extends ReadonlyArray<unknown>> = KeysOfHelper<Ts, never>;

/**
 * Tail-recursive helper type for KeysOf.
 */
type KeysOfHelper<
  Ts extends ReadonlyArray<unknown>,
  Acc
> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Record<PropertyKey, unknown>
    ? Rest extends ReadonlyArray<unknown>
      ? KeysOfHelper<Rest, Acc | keyof Head>
      : Acc | keyof Head
    : never
  : Acc;

/**
 * Get the keys of the type what match a certain criteria.
 */
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Get the required keys of the type.
 */
type RequiredKeys<T> = Exclude<
  KeysOfType<T, Exclude<T[keyof T], undefined>>,
  undefined
>;

/**
 * Get all the required keys on the types in the tuple.
 */
export type RequiredKeysOf<Ts extends readonly [unknown, ...unknown[]]> =
  Ts extends readonly [infer Head, ...infer Rest]
    ? Head extends Record<PropertyKey, unknown>
      ? Rest extends readonly [unknown, ...unknown[]]
        ? RequiredKeys<Head> | RequiredKeysOf<Rest>
        : RequiredKeys<Head>
      : never
    : never;

/**
 * Get the optional keys of the type.
 */
type OptionalKeys<T> = Exclude<keyof T, RequiredKeys<T>>;

/**
 * Get all the optional keys on the types in the tuple.
 */
export type OptionalKeysOf<Ts extends readonly [unknown, ...unknown[]]> =
  Ts extends readonly [infer Head, ...infer Rest]
    ? Head extends Record<PropertyKey, unknown>
      ? Rest extends readonly [unknown, ...unknown[]]
        ? OptionalKeys<Head> | OptionalKeysOf<Rest>
        : OptionalKeys<Head>
      : never
    : never;

/**
 * Filter out nevers from a tuple.
 */
export type FilterOutNever<T extends ReadonlyArray<unknown>> =
  T extends readonly []
    ? []
    : T extends [infer Head, ...infer Rest]
    ? IsNever<Head> extends true
      ? FilterOutNever<Rest>
      : [Head, ...FilterOutNever<Rest>]
    : T;

/**
 * Is the type a tuple?
 */
export type IsTuple<T extends ReadonlyArray<unknown>> = T extends readonly []
  ? true
  : T extends readonly [unknown, ...unknown[]]
  ? true
  : false;
