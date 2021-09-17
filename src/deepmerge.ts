import type {
  DeepMergeHKT,
  DeepMergeArraysDefaultHKT,
  DeepMergeMergeFunctionsDefaultURIs,
  DeepMergeMapsDefaultHKT,
  DeepMergeMergeFunctionsURIs,
  DeepMergeOptions,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
  DeepMergeMergeFunctionUtils,
  GetDeepMergeMergeFunctionsURIs,
  RecordProperty,
} from "./types";
import {
  getIterableOfIterables,
  getKeys,
  getObjectType,
  ObjectType,
  objectHasProperty,
} from "./utils";

const defaultOptions = {
  mergeMaps,
  mergeSets,
  mergeArrays,
  mergeRecords,
  mergeOthers: leaf,
} as const;

/**
 * The default merge functions.
 */
export type DeepMergeMergeFunctionsDefaults = typeof defaultOptions;

/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
export function deepmerge<Ts extends ReadonlyArray<unknown>>(
  ...objects: readonly [...Ts]
): DeepMergeHKT<Ts, DeepMergeMergeFunctionsDefaultURIs> {
  return deepmergeCustom({})(...objects) as DeepMergeHKT<
    Ts,
    DeepMergeMergeFunctionsDefaultURIs
  >;
}

/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
export function deepmergeCustom<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>
>(
  options: DeepMergeOptions
): <Ts extends ReadonlyArray<unknown>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>> {
  /**
   * The type of the customized deepmerge function.
   */
  type CustomizedDeepmerge = <Ts extends ReadonlyArray<unknown>>(
    ...objects: Ts
  ) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>>;

  const utils = getUtils(options, customizedDeepmerge as CustomizedDeepmerge);

  /**
   * The customized deepmerge function.
   */
  function customizedDeepmerge(...objects: ReadonlyArray<unknown>) {
    if (objects.length === 0) {
      return undefined;
    }
    if (objects.length === 1) {
      return objects[0];
    }

    return mergeUnknowns(objects, utils);
  }

  return customizedDeepmerge as CustomizedDeepmerge;
}

/**
 * The the full options with defaults apply.
 *
 * @param options - The options the user specified
 */
function getUtils(
  options: DeepMergeOptions,
  customizedDeepmerge: DeepMergeMergeFunctionUtils["deepmerge"]
): DeepMergeMergeFunctionUtils {
  return {
    defaultMergeFunctions: defaultOptions,
    mergeFunctions: {
      ...defaultOptions,
      ...Object.fromEntries(
        Object.entries(options).map(([key, option]) =>
          option === false ? [key, leaf] : [key, option]
        )
      ),
    } as DeepMergeMergeFunctionUtils["mergeFunctions"],
    deepmerge: customizedDeepmerge,
  };
}

/**
 * Merge unknown things.
 *
 * @param values - The values.
 */
function mergeUnknowns<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(values: Ts, utils: U): DeepMergeHKT<Ts, MF> {
  const type = getObjectType(values[0]);

  // eslint-disable-next-line functional/no-conditional-statement -- add an early escape for better performance.
  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    // eslint-disable-next-line functional/no-loop-statement, functional/no-let -- using a loop here is more performant than mapping every value and then testing every value.
    for (let i = 1; i < values.length; i++) {
      // eslint-disable-next-line functional/no-conditional-statement -- waiting on https://github.com/jonaskello/eslint-plugin-functional/issues/269
      if (getObjectType(values[i]) === type) {
        continue;
      }

      return utils.mergeFunctions.mergeOthers(values, utils) as DeepMergeHKT<
        Ts,
        MF
      >;
    }
  }

  switch (type) {
    case ObjectType.RECORD:
      return utils.mergeFunctions.mergeRecords(
        values as ReadonlyArray<Readonly<Record<RecordProperty, unknown>>>,
        utils
      ) as DeepMergeHKT<Ts, MF>;

    case ObjectType.ARRAY:
      return utils.mergeFunctions.mergeArrays(
        values as ReadonlyArray<ReadonlyArray<unknown>>,
        utils
      ) as DeepMergeHKT<Ts, MF>;

    case ObjectType.SET:
      return utils.mergeFunctions.mergeSets(
        values as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils
      ) as DeepMergeHKT<Ts, MF>;

    case ObjectType.MAP:
      return utils.mergeFunctions.mergeMaps(
        values as ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
        utils
      ) as DeepMergeHKT<Ts, MF>;

    default:
      return utils.mergeFunctions.mergeOthers(values, utils) as DeepMergeHKT<
        Ts,
        MF
      >;
  }
}

/**
 * Merge records.
 *
 * @param values - The records.
 */
function mergeRecords<
  Ts extends ReadonlyArray<Record<RecordProperty, unknown>>,
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(values: Ts, utils: U) {
  const result: Record<RecordProperty, unknown> = {};

  /* eslint-disable functional/no-loop-statement, functional/no-conditional-statement -- using a loop here is more performant. */

  for (const key of getKeys(values)) {
    const propValues = [];

    for (const value of values) {
      if (objectHasProperty(value, key)) {
        propValues.push(value[key]);
      }
    }

    // assert(propValues.length > 0);

    result[key] =
      propValues.length === 1
        ? propValues[0]
        : mergeUnknowns(propValues, utils);
  }

  /* eslint-enable functional/no-loop-statement, functional/no-conditional-statement */

  return result as DeepMergeRecordsDefaultHKT<Ts, MF>;
}

/**
 * Merge arrays.
 *
 * @param values - The arrays.
 */
function mergeArrays<
  Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(values: Ts, utils: U) {
  return values.flat() as DeepMergeArraysDefaultHKT<Ts, MF>;
}

/**
 * Merge sets.
 *
 * @param values - The sets.
 */
function mergeSets<
  Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(values: Ts, utils: U) {
  return new Set(getIterableOfIterables(values)) as DeepMergeSetsDefaultHKT<
    Ts,
    MF
  >;
}

/**
 * Merge maps.
 *
 * @param values - The maps.
 */
function mergeMaps<
  Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(values: Ts, utils: U) {
  return new Map(getIterableOfIterables(values)) as DeepMergeMapsDefaultHKT<
    Ts,
    MF
  >;
}

/**
 * Merge "other" things.
 *
 * @param values - The values.
 */
function leaf<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeMergeFunctionUtils,
  MF extends DeepMergeMergeFunctionsURIs
>(values: Ts, utils: U) {
  return values[values.length - 1];
}
