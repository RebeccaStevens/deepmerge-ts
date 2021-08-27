import type { RecordProperty } from "./basics";

/**
 * Flatten a complex type such as a union or intersection of objects into a
 * single object.
 */
export type FlatternAlias<T> = { [P in keyof T]: T[P] } & {};

/**
 * Get the value of the given key in the given object.
 */
export type ValueOfKey<T, K> = K extends keyof T ? T[K] : never;

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
 * Returns whether or not the given type a record.
 */
export type IsRecord<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<Record<RecordProperty, unknown>> ? true : false
>;

/**
 * Returns whether or not the given type is an array.
 */
export type IsArray<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<ReadonlyArray<unknown>> ? true : false
>;

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
 * Returns whether or not the given type is an map.
 */
export type IsMap<T> = And<
  Not<IsNever<T>>,
  T extends Readonly<ReadonlyMap<unknown, unknown>> ? true : false
>;

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
