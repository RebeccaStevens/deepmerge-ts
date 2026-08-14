import { actions } from "../actions.ts";
import { mergeUnknownsFast } from "../deepmerge-fast.ts";
import type {
  DeepMergeFunctionsURIs,
  DeepMergeMapsDefaultHKT,
  DeepMergeMetaData,
  DeepMergeMetaMetaData,
  DeepMergeRecordsDefaultHKT,
  DeepMergeUtils,
} from "../types/index.ts";
import { getKeysOfObjects, objectHasProperty } from "../utils.ts";

import { mergeArrays, mergeOthers, mergeSets } from "./general.ts";

/**
 * The fast default merge functions.
 */
export type MergeFunctionsFast = {
  mergeRecords: typeof mergeRecordsFast;
  mergeArrays: typeof mergeArrays;
  mergeSets: typeof mergeSets;
  mergeMaps: typeof mergeMapsFast;
  mergeOthers: typeof mergeOthers;
};

/**
 * The fast default strategy to merge records without circular reference checks or depth limits.
 *
 * Assumes input is trusted and non-circular.
 *
 * @param values - The records.
 * @param utils - The utils.
 */
function mergeRecordsFast<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils: U): DeepMergeRecordsDefaultHKT<Ts, Fs, M> {
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

    const propertyResult = mergeUnknownsFast<ReadonlyArray<unknown>, U, Fs, M, MM>(propValues, utils);

    if (propertyResult === actions.skip) {
      continue;
    }

    result[key] = propertyResult;
  }

  return result as DeepMergeRecordsDefaultHKT<Ts, Fs, M>;
}

/**
 * The fast default strategy to merge maps without circular reference checks or depth limits.
 *
 * Assumes input is trusted and non-circular.
 *
 * @param values - The maps.
 * @param utils - The utils.
 */
function mergeMapsFast<
  Ts extends ReadonlyArray<ReadonlyMap<unknown, unknown>>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils: U): DeepMergeMapsDefaultHKT<Ts> {
  const result = new Map<unknown, unknown>();

  const valuesByKey = new Map<unknown, unknown[]>();
  for (const map of values) {
    for (const [key, value] of map) {
      const mut_keyValues = valuesByKey.get(key);
      if (mut_keyValues === undefined) {
        valuesByKey.set(key, [value]);
      } else {
        mut_keyValues.push(value);
      }
    }
  }

  for (const [key, keyValues] of valuesByKey) {
    const keyResult = mergeUnknownsFast<ReadonlyArray<unknown>, U, Fs, M, MM>(keyValues, utils);

    if (keyResult === actions.skip) {
      continue;
    }

    result.set(key, keyResult);
  }

  return result as DeepMergeMapsDefaultHKT<Ts>;
}

/**
 * The fast merge functions without circular reference checks.
 */
export const mergeFunctionsFast = {
  mergeRecords: mergeRecordsFast,
  mergeArrays,
  mergeSets,
  mergeMaps: mergeMapsFast,
  mergeOthers,
};
