import { mergeUnknownsIntoFast } from "../deepmerge-into-fast.ts";
import type { DeepMergeIntoUtils, DeepMergeMetaData, DeepMergeMetaMetaData, Reference } from "../types/index.ts";
import { getKeysOfObjects, objectHasProperty } from "../utils.ts";

import { mergeArraysInto, mergeOthersInto, mergeSetsInto } from "./general.ts";

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
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(mut_target: Reference<Record<PropertyKey, unknown>>, values: Ts, utils: U): void {
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

    const propertyTarget: Reference<unknown> = { value: propValues[0] };
    mergeUnknownsIntoFast<ReadonlyArray<unknown>, U, M, MM>(propertyTarget, propValues, utils);

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
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(mut_target: Reference<Map<unknown, unknown>>, values: Ts, utils: U): void {
  const valuesByKey = new Map<unknown, unknown[]>();
  for (let mut_i = 1; mut_i < values.length; mut_i++) {
    for (const [key, value] of values[mut_i]!) {
      const mut_keyValues = valuesByKey.get(key);
      if (mut_keyValues === undefined) {
        valuesByKey.set(key, [value]);
      } else {
        mut_keyValues.push(value);
      }
    }
  }

  for (const [key, keyValues] of valuesByKey) {
    const targetValue = mut_target.value.get(key);
    const allValues = targetValue === undefined ? keyValues : [targetValue, ...keyValues];

    const propTarget: Reference<unknown> = { value: allValues[0] };
    mergeUnknownsIntoFast<ReadonlyArray<unknown>, U, M, MM>(propTarget, allValues, utils);

    mut_target.value.set(key, propTarget.value);
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
