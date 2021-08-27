import type {
  DeepMergeHKT,
  DeepMergeArraysDefaultHKT,
  DeepMergeMergeFunctionsDefaultURIs,
  DeepMergeMapsDefaultHKT,
  DeepMergeMergeFunctionsURIs,
  DeepMergeOptions,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
  DeepMergeUnknownsHKT,
  DeepMergeMergeFunctionUtils,
  GetDeepMergeMergeFunctionsURIs,
  RecordProperty,
} from "./types";
import { getKeys, getObjectType, ObjectType, objectHasProperty } from "./utils";

const defaultOptions = {
  mergeMaps,
  mergeSets,
  mergeArrays,
  mergeRecords,
  mergeOthers,
} as const;

export type DeepMergeMergeFunctionsDefaults = typeof defaultOptions;

export function deepmerge<Ts extends readonly [unknown, ...unknown[]]>(
  ...objects: readonly [...Ts]
): DeepMergeHKT<Ts, DeepMergeMergeFunctionsDefaultURIs>;

export function deepmerge(
  ...objects: Readonly<ReadonlyArray<unknown>>
): unknown;

/**
 * Deeply merge two or more objects.
 *
 * @param objects - The objects to merge.
 */
export function deepmerge(
  ...objects: Readonly<ReadonlyArray<unknown>>
): unknown {
  return deepmergeCustom({})(...objects);
}

/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to custom the merge function.
 */
export function deepmergeCustom<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>
>(
  options: DeepMergeOptions
): <Ts extends Readonly<ReadonlyArray<unknown>>>(
  ...objects: Ts
) => Ts extends readonly [unknown, ...unknown[]]
  ? DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>>
  : unknown {
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

  return customizedDeepmerge as any;
}

/**
 * The the full options with defaults apply.
 *
 * @param options - The options the user specified
 */
function getUtils(
  options: DeepMergeOptions,
  deepmerge: any // TODO: types
): DeepMergeMergeFunctionUtils {
  return {
    defaultMergeFunctions: defaultOptions,
    mergeFunctions: {
      ...defaultOptions,
      ...options,
    },
    deepmerge,
  };
}

/**
 * Deeply merge two objects.
 *
 * @param x - The first object.
 * @param y - The second object.
 */
function deepmergeUnknowns<
  T1,
  T2,
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(x: T1, y: T2, utils: U): DeepMergeUnknownsHKT<T1, T2, MF> {
  const typeOfX = getObjectType(x);
  const typeOfY = getObjectType(y);

  if (typeOfX !== typeOfY) {
    return y as unknown as DeepMergeUnknownsHKT<T1, T2, MF>;
  }

  if (typeOfX === ObjectType.RECORD) {
    return utils.mergeFunctions.mergeRecords(
      x as Readonly<Record<RecordProperty, unknown>>,
      y as Readonly<Record<RecordProperty, unknown>>,
      utils
    ) as DeepMergeUnknownsHKT<T1, T2, MF>;
  }

  if (typeOfX === ObjectType.ARRAY) {
    return utils.mergeFunctions.mergeArrays(
      x as unknown as Readonly<ReadonlyArray<unknown>>,
      y as unknown as Readonly<ReadonlyArray<unknown>>,
      utils
    ) as DeepMergeUnknownsHKT<T1, T2, MF>;
  }

  if (typeOfX === ObjectType.SET) {
    return utils.mergeFunctions.mergeSets(
      x as unknown as Readonly<ReadonlySet<unknown>>,
      y as unknown as Readonly<ReadonlySet<unknown>>,
      utils
    ) as DeepMergeUnknownsHKT<T1, T2, MF>;
  }

  if (typeOfX === ObjectType.MAP) {
    return utils.mergeFunctions.mergeMaps(
      x as unknown as Readonly<ReadonlyMap<unknown, unknown>>,
      y as unknown as Readonly<ReadonlyMap<unknown, unknown>>,
      utils
    ) as DeepMergeUnknownsHKT<T1, T2, MF>;
  }

  return utils.mergeFunctions.mergeOthers(x, y, utils) as DeepMergeUnknownsHKT<
    T1,
    T2,
    MF
  >;
}

/**
 * Merge two records.
 *
 * @param x - The first records.
 * @param y - The second records.
 */
function mergeRecords<
  T1 extends Readonly<Record<RecordProperty, unknown>>,
  T2 extends Readonly<Record<RecordProperty, unknown>>,
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
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
  ) as DeepMergeRecordsDefaultHKT<T1, T2, MF>;
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
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(x: T1, y: T2, utils: U) {
  return [...x, ...y] as DeepMergeArraysDefaultHKT<T1, T2, MF>;
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
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(x: T1, y: T2, utils: U) {
  return new Set([...x, ...y]) as DeepMergeSetsDefaultHKT<T1, T2, MF>;
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
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
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
  }, new Map()) as DeepMergeMapsDefaultHKT<T1, T2, MF>;
}

/**
 * Merge two other things.
 *
 * @param x - The first thing.
 * @param y - The second thing.
 */
function mergeOthers<
  T1,
  T2,
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(x: T1, y: T2, utils: U) {
  return y;
}
