import { actions } from "../actions.ts";
import { mergeUnknowns } from "../deepmerge.ts";
import type {
  DeepMergeArraysDefaultHKT,
  DeepMergeCircularReferencesDefaultHKT,
  DeepMergeFunctionsURIs,
  DeepMergeMapsDefaultHKT,
  DeepMergeMetaData,
  DeepMergeMetaMetaData,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
  DeepMergeUtils,
} from "../types/index.ts";
import { getCyclicReferenceDepth, getIterableOfIterables, getKeysOfObjects, objectHasProperty } from "../utils.ts";

/**
 * The default merge functions.
 */
export type MergeFunctions = {
  mergeRecords: typeof mergeRecords;
  mergeArrays: typeof mergeArrays;
  mergeSets: typeof mergeSets;
  mergeMaps: typeof mergeMaps;
  mergeCircularReferences: typeof mergeCircularReferences;
  mergeOthers: typeof mergeOthers;
};

/**
 * The default strategy to merge records.
 *
 * @param values - The records.
 */
function mergeRecords<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils: U, meta: M): DeepMergeRecordsDefaultHKT<Ts, Fs, M> {
  const result: Record<PropertyKey, unknown> = {};

  for (const key of getKeysOfObjects(values)) {
    const propValues = [];

    for (const value of values) {
      if (objectHasProperty(value, key)) {
        propValues.push(value[key]);
      }
    }

    if (propValues.length === 0) {
      continue;
    }

    const updatedMeta = utils.metaDataUpdater(meta, {
      key,
      parents: values,
      values: propValues,
      result,
    } satisfies DeepMergeMetaMetaData as unknown as MM);

    const propertyResult = mergeUnknowns<ReadonlyArray<unknown>, U, Fs, M, MM>(propValues, utils, updatedMeta);

    if (propertyResult === actions.skip) {
      continue;
    }

    if (key === "__proto__") {
      Object.defineProperty(result, key, {
        value: propertyResult,
        configurable: true,
        enumerable: true,
        writable: true,
      });
    } else {
      result[key] = propertyResult;
    }
  }

  return result as DeepMergeRecordsDefaultHKT<Ts, Fs, M>;
}

/**
 * The default strategy to merge arrays.
 *
 * @param values - The arrays.
 */
function mergeArrays<
  Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils: U, meta: M): DeepMergeArraysDefaultHKT<Ts, Fs, M> {
  return values.flat() as DeepMergeArraysDefaultHKT<Ts, Fs, M>;
}

/**
 * The default strategy to merge sets.
 *
 * @param values - The sets.
 */
function mergeSets<
  Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils: U, meta: M): DeepMergeSetsDefaultHKT<Ts> {
  return new Set(getIterableOfIterables(values)) as DeepMergeSetsDefaultHKT<Ts>;
}

/**
 * The default strategy to merge maps.
 *
 * @param values - The maps.
 */
function mergeMaps<
  Ts extends ReadonlyArray<ReadonlyMap<unknown, unknown>>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils: U, meta: M): DeepMergeMapsDefaultHKT<Ts> {
  const result = new Map<unknown, unknown>();

  const valuesByKey = new Map<unknown, unknown[]>();
  for (const [key, value] of getIterableOfIterables(values)) {
    const mut_keyValues = valuesByKey.get(key);
    if (mut_keyValues === undefined) {
      valuesByKey.set(key, [value]);
    } else {
      mut_keyValues.push(value);
    }
  }

  for (const [key, keyValues] of valuesByKey) {
    const updatedMeta = utils.metaDataUpdater(meta, {
      key,
      parents: values,
      values: keyValues,
      result,
    } satisfies DeepMergeMetaMetaData as unknown as MM);

    const keyResult = mergeUnknowns<ReadonlyArray<unknown>, U, Fs, M, MM>(keyValues, utils, updatedMeta);

    if (keyResult === actions.skip) {
      continue;
    }

    result.set(key, keyResult);
  }

  return result as DeepMergeMapsDefaultHKT<Ts>;
}

/**
 * The default strategy to merge circular references.
 *
 * @param values - The circular references.
 */
function mergeCircularReferences<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(
  values: Ts,
  cyclicDepths: ReadonlyArray<number>,
  utils: U,
  meta: M,
): DeepMergeCircularReferencesDefaultHKT<Ts, Fs, M> {
  const depth = cyclicDepths[0]!;
  for (let mut_index = 1; mut_index < values.length; mut_index++) {
    if (cyclicDepths[mut_index] !== depth) {
      const lastCyclicDepth = cyclicDepths.at(mut_index)!;
      return (
        lastCyclicDepth === 0 ? values.at(-1) : meta?.hierarchy?.at(-lastCyclicDepth)?.result
      ) as DeepMergeCircularReferencesDefaultHKT<Ts, Fs, M>;
    }
  }
  return meta?.hierarchy?.at(-depth)?.result as DeepMergeCircularReferencesDefaultHKT<Ts, Fs, M>;
}

/**
 * Get the last value in the given array.
 */
function mergeOthers<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils: U, meta: M): unknown {
  return values.at(-1);
}

/**
 * The merge functions.
 */
export const mergeFunctions = {
  mergeRecords,
  mergeArrays,
  mergeSets,
  mergeMaps,
  mergeCircularReferences,
  mergeOthers,
};
