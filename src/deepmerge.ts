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
  const types = values.map(getObjectType);
  const type = types[0];

  if (types.every((value) => value === type)) {
    if (type === ObjectType.RECORD) {
      return utils.mergeFunctions.mergeRecords(
        values as ReadonlyArray<Readonly<Record<RecordProperty, unknown>>>,
        utils
      ) as DeepMergeHKT<Ts, MF>;
    }

    if (type === ObjectType.ARRAY) {
      return utils.mergeFunctions.mergeArrays(
        values as ReadonlyArray<ReadonlyArray<unknown>>,
        utils
      ) as DeepMergeHKT<Ts, MF>;
    }

    if (type === ObjectType.SET) {
      return utils.mergeFunctions.mergeSets(
        values as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils
      ) as DeepMergeHKT<Ts, MF>;
    }

    if (type === ObjectType.MAP) {
      return utils.mergeFunctions.mergeMaps(
        values as ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
        utils
      ) as DeepMergeHKT<Ts, MF>;
    }
  }

  return utils.mergeFunctions.mergeOthers(values, utils) as DeepMergeHKT<
    Ts,
    MF
  >;
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
  const neverValue = {};
  return Object.fromEntries(
    [...getKeys(values)]
      .map((key) => {
        const propValues = values
          .map((value) =>
            objectHasProperty(value, key) ? value[key] : neverValue
          )
          .filter((value) => value !== neverValue);

        // assert(propValues.length > 0);

        if (propValues.length === 1) {
          return [key, propValues[0]];
        }

        return [key, mergeUnknowns(propValues, utils)];
      })
      .filter((value): value is [unknown, unknown] => value !== neverValue)
  ) as DeepMergeRecordsDefaultHKT<Ts, MF>;
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
