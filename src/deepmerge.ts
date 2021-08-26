import type {
  DeepMerge,
  DeepMergeArrays,
  DeepMergeMaps,
  DeepMergeRecords,
  DeepMergeSets,
  DeepMergeUnknowns,
  DeepMergeDefaultURI,
  DeepMergeOptions,
  DeepMergeOptionsFull,
  DeepMergeUtils,
  Property,
} from "./types";
import { getKeys, getObjectType, ObjectType, objectHasProperty } from "./utils";

const defaultOptions: DeepMergeOptionsFull = {
  mergeMaps,
  mergeSets,
  mergeArrays,
  mergeRecords,
  mergeOthers,
};

/**
 * Deeply merge two or more objects.
 *
 * @param objects - The objects to merge.
 */
export function deepmerge<Ts extends readonly [unknown, ...unknown[]]>(
  ...objects: readonly [...Ts]
): DeepMerge<Ts, DeepMergeDefaultURI>;

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
  return deepmergeCustom()(...objects);
}

/**
 * Deeply merge two or more objects using the given merge function.
 *
 * @param options - The options on how to custom the merge function.
 */
export function deepmergeCustom(
  options: DeepMergeOptions = {}
): (...objects: Readonly<ReadonlyArray<unknown>>) => unknown {
  const utils = getUtils(options, customizedDeepmerge);

  function customizedDeepmerge(...objects: Readonly<ReadonlyArray<unknown>>) {
    if (objects.length === 0) {
      return undefined;
    }
    if (objects.length === 1) {
      return objects[0];
    }

    return objects.reduce((carry, item) =>
      deepmergeUnknowns(carry, item, utils)
    );
  }

  return customizedDeepmerge;
}

/**
 * The the full options with defaults apply.
 *
 * @param options - The options the user specified
 */
function getUtils(options: DeepMergeOptions, deepmerge: any): DeepMergeUtils {
  return {
    ...defaultOptions,
    ...options,
    deepmerge,
  };
}

/**
 * Deeply merge two objects.
 *
 * @param x - The first object.
 * @param y - The second object.
 */
function deepmergeUnknowns<T1, T2, U extends DeepMergeUtils>(
  x: T1,
  y: T2,
  utils: U
): DeepMergeUnknowns<T1, T2> {
  const typeOfX = getObjectType(x);
  const typeOfY = getObjectType(y);

  if (typeOfX !== typeOfY) {
    return y as DeepMergeUnknowns<T1, T2>;
  }

  if (typeOfX === ObjectType.RECORD) {
    return utils.mergeRecords(
      x as Readonly<Record<Property, unknown>>,
      y as Readonly<Record<Property, unknown>>,
      utils
    ) as DeepMergeUnknowns<T1, T2>;
  }

  if (typeOfX === ObjectType.ARRAY) {
    return utils.mergeArrays(
      x as unknown as Readonly<ReadonlyArray<unknown>>,
      y as unknown as Readonly<ReadonlyArray<unknown>>,
      utils
    ) as DeepMergeUnknowns<T1, T2>;
  }

  if (typeOfX === ObjectType.SET) {
    return utils.mergeSets(
      x as unknown as Readonly<ReadonlySet<unknown>>,
      y as unknown as Readonly<ReadonlySet<unknown>>,
      utils
    ) as DeepMergeUnknowns<T1, T2>;
  }

  if (typeOfX === ObjectType.MAP) {
    return utils.mergeMaps(
      x as unknown as Readonly<ReadonlyMap<unknown, unknown>>,
      y as unknown as Readonly<ReadonlyMap<unknown, unknown>>,
      utils
    ) as DeepMergeUnknowns<T1, T2>;
  }

  return utils.mergeOthers(x, y, utils) as DeepMergeUnknowns<T1, T2>;
}

/**
 * Merge two records.
 *
 * @param x - The first records.
 * @param y - The second records.
 */
function mergeRecords<
  T1 extends Readonly<Record<Property, unknown>>,
  T2 extends Readonly<Record<Property, unknown>>,
  U extends DeepMergeUtils
>(x: T1, y: T2, utils: U) {
  return Object.fromEntries(
    [...getKeys([x, y])].map((key) => {
      const xHasKey = objectHasProperty(x, key);
      const yHasKey = objectHasProperty(y, key);

      if (xHasKey && yHasKey) {
        return [key, deepmergeUnknowns(x[key], y[key], utils)];
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
  T2 extends Readonly<ReadonlyArray<unknown>>,
  U extends DeepMergeUtils
>(x: T1, y: T2, utils: U) {
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
  T2 extends Readonly<ReadonlySet<unknown>>,
  U extends DeepMergeUtils
>(x: T1, y: T2, utils: U) {
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
  T2 extends Readonly<ReadonlyMap<unknown, unknown>>,
  U extends DeepMergeUtils
>(x: T1, y: T2, utils: U) {
  return [x, y].reduce((mutableCarry, current) => {
    // eslint-disable-next-line functional/no-loop-statement -- using a loop here is more efficient.
    for (const [key, value] of current.entries()) {
      mutableCarry.set(
        key,
        deepmergeUnknowns(mutableCarry.get(key), value, utils)
      );
    }
    return mutableCarry;
  }, new Map()) as DeepMergeMaps<T1, T2>;
}

/**
 * Merge two other things.
 *
 * @param x - The first thing.
 * @param y - The second thing.
 */
function mergeOthers<T1, T2, U extends DeepMergeUtils>(x: T1, y: T2, utils: U) {
  return y;
}
