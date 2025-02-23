import { mergeUnknownsInto } from "../deepmerge-into.ts";
import type { DeepMergeBuiltInMetaData, DeepMergeIntoFunctionUtils, Reference } from "../types/index.ts";
import { getIterableOfIterables, getKeys, objectHasProperty } from "../utils.ts";

/**
 * The default merge functions.
 */
export type MergeFunctions = {
  mergeRecords: typeof mergeRecordsInto;
  mergeArrays: typeof mergeArraysInto;
  mergeSets: typeof mergeSetsInto;
  mergeMaps: typeof mergeMapsInto;
  mergeOthers: typeof mergeOthersInto;
};

/**
 * The default strategy to merge records into a target record.
 *
 * @param mut_target - The result will be mutated into this record
 * @param values - The records (including the target's value if there is one).
 */
function mergeRecordsInto<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeIntoFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(mut_target: Reference<Record<PropertyKey, unknown>>, values: Ts, utils: U, meta: M | undefined): void {
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

    const propertyTarget: Reference<unknown> = { value: propValues[0] };
    mergeUnknownsInto<ReadonlyArray<unknown>, U, M, MM>(propertyTarget, propValues, utils, updatedMeta);

    if (key === "__proto__") {
      Object.defineProperty(mut_target.value, key, {
        value: propertyTarget.value,
        configurable: true,
        enumerable: true,
        writable: true,
      });
    } else {
      mut_target.value[key] = propertyTarget.value;
    }
  }
}

/**
 * The default strategy to merge arrays into a target array.
 *
 * @param mut_target - The result will be mutated into this array
 * @param values - The arrays (including the target's value if there is one).
 */
function mergeArraysInto<Ts extends ReadonlyArray<ReadonlyArray<unknown>>>(
  mut_target: Reference<unknown[]>,
  values: Ts,
): void {
  mut_target.value.push(...values.slice(1).flat());
}

/**
 * The default strategy to merge sets into a target set.
 *
 * @param mut_target - The result will be mutated into this set
 * @param values - The sets (including the target's value if there is one).
 */
function mergeSetsInto<Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>>(
  mut_target: Reference<Set<unknown>>,
  values: Ts,
): void {
  for (const value of getIterableOfIterables(values.slice(1))) {
    mut_target.value.add(value);
  }
}

/**
 * The default strategy to merge maps into a target map.
 *
 * @param mut_target - The result will be mutated into this map
 * @param values - The maps (including the target's value if there is one).
 */
function mergeMapsInto<Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>>(
  mut_target: Reference<Map<unknown, unknown>>,
  values: Ts,
): void {
  for (const [key, value] of getIterableOfIterables(values.slice(1))) {
    mut_target.value.set(key, value);
  }
}

/**
 * Set the target to the last value.
 */
function mergeOthersInto<Ts extends ReadonlyArray<unknown>>(mut_target: Reference<unknown>, values: Ts) {
  mut_target.value = values.at(-1);
}

/**
 * The merge functions.
 */
export const mergeIntoFunctions = {
  mergeRecords: mergeRecordsInto,
  mergeArrays: mergeArraysInto,
  mergeSets: mergeSetsInto,
  mergeMaps: mergeMapsInto,
  mergeOthers: mergeOthersInto,
};
