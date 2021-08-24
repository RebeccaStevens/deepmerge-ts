import type {
  DeepMerge,
  DeepMergeArrays,
  DeepMergeMaps,
  DeepMergeRecords,
  DeepMergeSets,
  DeepMergeUnknowns,
  Property,
} from "./types";
import { getKeys, getObjectType, ObjectType, objectHasProperty } from "./utils";

/**
 * Deeply merge two or more objects.
 *
 * @param objects - The objects to merge.
 */
export function deepmerge<Ts extends readonly [unknown, ...unknown[]]>(
  ...objects: readonly [...Ts]
): DeepMerge<Ts>;

/**
 * Deeply merge two or more objects.
 *
 * @param objects - The objects to merge.
 */
export function deepmerge(
  ...objects: Readonly<ReadonlyArray<unknown>>
): unknown;
export function deepmerge(
  ...objects: Readonly<ReadonlyArray<unknown>>
): unknown {
  if (objects.length === 0) {
    return {};
  }
  if (objects.length === 1) {
    return objects[0];
  }

  return objects.reduce(deepmergeUnknowns);
}

/**
 * Deeply merge two objects.
 *
 * @param x - The first object.
 * @param y - The second object.
 */
function deepmergeUnknowns<T1, T2>(x: T1, y: T2): DeepMergeUnknowns<T1, T2> {
  const typeOfX = getObjectType(x);
  const typeOfY = getObjectType(y);

  if (
    typeOfX !== typeOfY ||
    typeOfX === ObjectType.NOT ||
    typeOfX === ObjectType.OTHER
  ) {
    return y as DeepMergeUnknowns<T1, T2>;
  }

  if (typeOfX === ObjectType.RECORD) {
    return mergeRecords(
      x as Readonly<Record<Property, unknown>>,
      y as Readonly<Record<Property, unknown>>
    ) as DeepMergeUnknowns<T1, T2>;
  }

  if (typeOfX === ObjectType.ARRAY) {
    return mergeArrays(
      x as unknown as Readonly<ReadonlyArray<unknown>>,
      y as unknown as Readonly<ReadonlyArray<unknown>>
    ) as DeepMergeUnknowns<T1, T2>;
  }

  if (typeOfX === ObjectType.SET) {
    return mergeSets(
      x as unknown as Readonly<ReadonlySet<unknown>>,
      y as unknown as Readonly<ReadonlySet<unknown>>
    ) as unknown as DeepMergeUnknowns<T1, T2>;
  }

  return mergeMaps(
    x as unknown as Readonly<ReadonlyMap<unknown, unknown>>,
    y as unknown as Readonly<ReadonlyMap<unknown, unknown>>
  ) as unknown as DeepMergeUnknowns<T1, T2>;
}

/**
 * Merge two records.
 *
 * @param x - The first records.
 * @param y - The second records.
 */
function mergeRecords<
  T1 extends Readonly<Record<Property, unknown>>,
  T2 extends Readonly<Record<Property, unknown>>
>(x: T1, y: T2) {
  return Object.fromEntries(
    [...getKeys([x, y])].map((key) => {
      const xHasKey = objectHasProperty(x, key);
      const yHasKey = objectHasProperty(y, key);

      if (xHasKey && yHasKey) {
        return [key, deepmergeUnknowns(x[key], y[key])];
      }
      if (yHasKey) {
        return [key, y[key]];
      }
      return [key, x[key]];
    })
  ) as DeepMergeRecords<T1, T2>;
}

/**
 * Merge two arrays.
 *
 * @param x - The first array.
 * @param y - The second array.
 */
function mergeArrays<
  T1 extends Readonly<ReadonlyArray<unknown>>,
  T2 extends Readonly<ReadonlyArray<unknown>>
>(x: T1, y: T2) {
  return [...x, ...y] as DeepMergeArrays<T1, T2>;
}

/**
 * Merge two sets.
 *
 * @param x - The first sets.
 * @param y - The second sets.
 */
function mergeSets<
  T1 extends Readonly<ReadonlySet<unknown>>,
  T2 extends Readonly<ReadonlySet<unknown>>
>(x: T1, y: T2) {
  return new Set([...x, ...y]) as DeepMergeSets<T1, T2>;
}

/**
 * Merge two maps.
 *
 * @param x - The first maps.
 * @param y - The second maps.
 */
function mergeMaps<
  T1 extends Readonly<ReadonlyMap<unknown, unknown>>,
  T2 extends Readonly<ReadonlyMap<unknown, unknown>>
>(x: T1, y: T2) {
  return [x, y].reduce((mutableCarry, current) => {
    // eslint-disable-next-line functional/no-loop-statement -- using a loop here is more efficient.
    for (const [key, value] of current.entries()) {
      mutableCarry.set(key, deepmergeUnknowns(mutableCarry.get(key), value));
    }
    return mutableCarry;
  }, new Map()) as DeepMergeMaps<T1, T2>;
}
