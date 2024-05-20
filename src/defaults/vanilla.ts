import { actions } from "../actions";
import { mergeUnknowns } from "../deepmerge";
import {
  type DeepMergeArraysDefaultHKT,
  type DeepMergeBuiltInMetaData,
  type DeepMergeFunctionsURIs,
  type DeepMergeMapsDefaultHKT,
  type DeepMergeRecordsDefaultHKT,
  type DeepMergeSetsDefaultHKT,
  type DeepMergeUtils,
} from "../types";
import { getIterableOfIterables, getKeys, objectHasProperty } from "../utils";

/**
 * The default merge functions.
 */
export type MergeFunctions = {
  mergeRecords: typeof mergeRecords;
  mergeArrays: typeof mergeArrays;
  mergeSets: typeof mergeSets;
  mergeMaps: typeof mergeMaps;
  mergeOthers: typeof mergeOthers;
};

/**
 * The default strategy to merge records.
 *
 * @param values - The records.
 */
export function mergeRecords<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  values: Ts,
  utils: U,
  meta: M | undefined,
): DeepMergeRecordsDefaultHKT<Ts, Fs, M> {
  const result: Record<PropertyKey, unknown> = {};

  for (const key of getKeys(values)) {
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
    } as unknown as MM);

    const propertyResult = mergeUnknowns<ReadonlyArray<unknown>, U, Fs, M, MM>(
      propValues,
      utils,
      updatedMeta,
    );

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
export function mergeArrays<
  Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
  Fs extends DeepMergeFunctionsURIs,
  M,
>(values: Ts): DeepMergeArraysDefaultHKT<Ts, Fs, M> {
  return values.flat() as DeepMergeArraysDefaultHKT<Ts, Fs, M>;
}

/**
 * The default strategy to merge sets.
 *
 * @param values - The sets.
 */
export function mergeSets<
  Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
>(values: Ts): DeepMergeSetsDefaultHKT<Ts> {
  return new Set(getIterableOfIterables(values)) as DeepMergeSetsDefaultHKT<Ts>;
}

/**
 * The default strategy to merge maps.
 *
 * @param values - The maps.
 */
export function mergeMaps<
  Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
>(values: Ts): DeepMergeMapsDefaultHKT<Ts> {
  return new Map(getIterableOfIterables(values)) as DeepMergeMapsDefaultHKT<Ts>;
}

/**
 * Get the last non-undefined value in the given array.
 */
export function mergeOthers<Ts extends ReadonlyArray<unknown>>(values: Ts) {
  return values.at(-1);
}
