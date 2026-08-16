import { mergeUnknownsIntoFast } from "../deepmerge-into-fast.ts";
import type {
  DeepMergeIntoUtils,
  DeepMergeMergeInfo,
  DeepMergeMetaData,
  DeepMergeValueReference,
} from "../types/index.ts";
import { getKeysOfObject, getKeysOfObjects, objectHasProperty } from "../utils.ts";

import { emptyLike, mergeArraysInto, mergeOthersInto, mergeSetsInto } from "./general.ts";

/**
 * The fast default merge functions.
 */
export type MergeFunctionsFast = {
  mergeRecords: typeof mergeRecordsIntoFast;
  mergeArrays: typeof mergeArraysInto;
  mergeSets: typeof mergeSetsInto;
  mergeMaps: typeof mergeMapsIntoFast;
  mergeOthers: typeof mergeOthersInto;
};

/**
 * The fast default strategy to merge records into a target record without circular reference checks or depth limits.
 *
 * Assumes input is trusted and non-circular.
 *
 * @param mut_target - The target to merge into.
 * @param values - The records (including the target's value if there is one).
 * @param utils - The utils.
 */
function mergeRecordsIntoFast<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<Record<PropertyKey, unknown>>, values: Ts, utils: U): void {
  if (values.length === 2) {
    // Fast path for 2 records: avoid building a union key set and per-key value
    // arrays. Only the keys present in each record are iterated.
    const mergeProperty = (key: PropertyKey, propValues: unknown[]) => {
      const propertyTarget: DeepMergeValueReference<unknown> = objectHasProperty(mut_target.value, key)
        ? { value: propValues[0] }
        : { value: emptyLike(propValues[0]) };
      mergeUnknownsIntoFast<ReadonlyArray<unknown>, U, M, MI>(propertyTarget, propValues, utils);

      mut_target.value[key] = propertyTarget.value;
    };

    const firstValue = values[0]!;
    const secondValue = values[1]!;
    for (const key of getKeysOfObject(firstValue)) {
      mergeProperty(key, objectHasProperty(secondValue, key) ? [firstValue[key], secondValue[key]] : [firstValue[key]]);
    }
    for (const key of getKeysOfObject(secondValue)) {
      if (!objectHasProperty(firstValue, key)) {
        mergeProperty(key, [secondValue[key]]);
      }
    }
    return;
  }
  mergeRecordsIntoFastGeneral<Ts, U, M, MI>(mut_target, values, utils);
}

/**
 * The fast default strategy to merge 3 or more records into a target record without circular reference checks or depth limits.
 *
 * Assumes input is trusted and non-circular.
 *
 * @param mut_target - The target to merge into.
 * @param values - The records (including the target's value if there is one).
 * @param utils - The utils.
 */
function mergeRecordsIntoFastGeneral<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<Record<PropertyKey, unknown>>, values: Ts, utils: U): void {
  for (const key of getKeysOfObjects(values)) {
    const propValues = [];

    for (const value of values) {
      if (objectHasProperty(value, key)) {
        propValues.push(value[key]);
      }
    }

    const propertyTarget: DeepMergeValueReference<unknown> = objectHasProperty(mut_target.value, key)
      ? { value: propValues[0] }
      : { value: emptyLike(propValues[0]) };
    mergeUnknownsIntoFast<ReadonlyArray<unknown>, U, M, MI>(propertyTarget, propValues, utils);

    mut_target.value[key] = propertyTarget.value;
  }
}

/**
 * The fast default strategy to merge maps into a target map without circular reference checks or depth limits.
 *
 * Assumes input is trusted and non-circular.
 *
 * @param mut_target - The target to merge into.
 * @param values - The maps (including the target's value if there is one).
 * @param utils - The utils.
 */
function mergeMapsIntoFast<
  Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<Map<unknown, unknown>>, values: Ts, utils: U): void {
  // See `mergeMapsInto` in `defaults/into.ts` for the full rationale.
  // Merge into `mut_target.value` in place.

  const valuesByKey = new Map<unknown, unknown[]>();
  for (const value of values) {
    if (value === mut_target.value) {
      // `values` includes the target's own map when the recursion target
      // already had the key; its entries are merged via `target.get(key)`.
      continue;
    }
    for (const [key, entryValue] of value) {
      const mut_keyValues = valuesByKey.get(key);
      if (mut_keyValues === undefined) {
        valuesByKey.set(key, [entryValue]);
      } else {
        mut_keyValues.push(entryValue);
      }
    }
  }

  const target = mut_target.value;
  for (const [key, keyValues] of valuesByKey) {
    const targetValue = target.get(key);
    const allValues = targetValue === undefined ? keyValues : [targetValue, ...keyValues];

    const propTarget: DeepMergeValueReference<unknown> =
      targetValue === undefined ? { value: emptyLike(allValues[0]) } : { value: targetValue };
    mergeUnknownsIntoFast<ReadonlyArray<unknown>, U, M, MI>(propTarget, allValues, utils);

    target.set(key, propTarget.value);
  }
}

/**
 * The fast merge functions without circular reference checks.
 */
export const mergeIntoFunctionsFast = {
  mergeRecords: mergeRecordsIntoFast,
  mergeArrays: mergeArraysInto,
  mergeSets: mergeSetsInto,
  mergeMaps: mergeMapsIntoFast,
  mergeOthers: mergeOthersInto,
};
