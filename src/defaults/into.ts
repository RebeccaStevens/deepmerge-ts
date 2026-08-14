import { mergeUnknownsInto } from "../deepmerge-into.ts";
import type { DeepMergeIntoUtils, DeepMergeMetaData, DeepMergeMetaMetaData, Reference } from "../types/index.ts";
import {
  ObjectType,
  getCyclicReferenceDepth,
  getKeysOfObject,
  getKeysOfObjects,
  getMetaDataHierarchy,
  getObjectType,
  objectHasProperty,
} from "../utils.ts";

import { mergeArraysInto, mergeOthersInto, mergeSetsInto } from "./general.ts";

/**
 * The default merge functions.
 */
export type MergeFunctions<
  M extends DeepMergeMetaData = DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
> = {
  mergeRecords: <Ts extends ReadonlyArray<Record<PropertyKey, unknown>>, U extends DeepMergeIntoUtils<M, MM>>(
    mut_target: Reference<Record<PropertyKey, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => void;
  mergeArrays: typeof mergeArraysInto;
  mergeSets: typeof mergeSetsInto;
  mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeIntoUtils<M, MM>>(
    mut_target: Reference<Map<unknown, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => void;
  mergeCircularReferences: <Ts extends ReadonlyArray<object>, U extends DeepMergeIntoUtils<M, MM>>(
    mut_target: Reference<unknown>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => void;
  mergeOthers: typeof mergeOthersInto;
};

/**
 * The default strategy to merge records into a target record.
 *
 * @param mut_target - The target to merge into.
 * @param values - The records (including the target's value if there is one).
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeRecordsInto<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(mut_target: Reference<Record<PropertyKey, unknown>>, values: Ts, utils: U, meta: M | undefined): void {
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
      result: mut_target.value,
    } satisfies DeepMergeMetaMetaData as unknown as MM);

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
 * The default strategy to merge maps into a target map.
 *
 * @param mut_target - The target to merge into.
 * @param values - The maps (including the target's value if there is one).
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeMapsInto<
  Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(mut_target: Reference<Map<unknown, unknown>>, values: Ts, utils: U, meta: M | undefined): void {
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
    const updatedMeta = utils.metaDataUpdater(meta, {
      key,
      parents: values,
      values: allValues,
      result: mut_target.value,
    } satisfies DeepMergeMetaMetaData as unknown as MM);

    const propTarget: Reference<unknown> = { value: allValues[0] };
    mergeUnknownsInto<ReadonlyArray<unknown>, U, M, MM>(propTarget, allValues, utils, updatedMeta);

    mut_target.value.set(key, propTarget.value);
  }
}

/**
 * Resolve any cyclic references within a non-cyclic object pointing to ancestors in meta.hierarchy.
 *
 * @param value - The value to resolve circular references for.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function resolveCyclicReferencesInto<
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(value: unknown, utils: U, meta: M | undefined): unknown {
  if (typeof value !== "object" || value === null) {
    return value;
  }
  const hierarchy = getMetaDataHierarchy(meta);
  const depth = getCyclicReferenceDepth(value, hierarchy, 0);
  if (depth > 0 && hierarchy !== undefined) {
    return hierarchy[hierarchy.length - depth]?.result ?? hierarchy[hierarchy.length - depth]?.parents[0];
  }
  const type = getObjectType(value);
  if (type === ObjectType.RECORD) {
    const record = value as Record<PropertyKey, unknown>;
    let mut_changed = false;
    const result: Record<PropertyKey, unknown> = {};
    for (const key of getKeysOfObject(record)) {
      const propVal = record[key];
      const updatedMeta = utils.metaDataUpdater(meta, {
        key,
        parents: [record],
        values: [propVal],
        result,
      } satisfies DeepMergeMetaMetaData as unknown as MM);
      const resolvedProp = resolveCyclicReferencesInto<U, M, MM>(propVal, utils, updatedMeta);
      if (resolvedProp !== propVal) {
        mut_changed = true;
      }
      if (key === "__proto__") {
        Object.defineProperty(result, key, {
          value: resolvedProp,
          configurable: true,
          enumerable: true,
          writable: true,
        });
      } else {
        result[key] = resolvedProp;
      }
    }
    return mut_changed ? result : value;
  }
  return value;
}

/**
 * The default strategy to merge circular references into a target.
 *
 * @param mut_target - The target to merge into.
 * @param values - The circular references.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeCircularReferencesInto<
  Ts extends ReadonlyArray<object>,
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(mut_target: Reference<unknown>, values: Ts, utils: U, meta: M | undefined): void {
  const hierarchy = getMetaDataHierarchy(meta);
  const cyclicDepths = values.map((v, i) => getCyclicReferenceDepth(v, hierarchy, i));
  const depth = cyclicDepths[0]!;
  for (let mut_index = 1; mut_index < values.length; mut_index++) {
    if (cyclicDepths[mut_index] !== depth) {
      const lastCyclicDepth = cyclicDepths.at(-1)!;
      mut_target.value =
        lastCyclicDepth === 0
          ? resolveCyclicReferencesInto<U, M, MM>(values.at(-1), utils, meta)
          : (hierarchy?.[hierarchy.length - lastCyclicDepth]?.result ??
            hierarchy?.[hierarchy.length - lastCyclicDepth]?.parents[0]);
      return;
    }
  }
  mut_target.value = hierarchy?.[hierarchy.length - depth]?.result ?? hierarchy?.[hierarchy.length - depth]?.parents[0];
}

/**
 * The merge functions.
 */
export const mergeIntoFunctions = {
  mergeRecords: mergeRecordsInto,
  mergeArrays: mergeArraysInto,
  mergeSets: mergeSetsInto,
  mergeMaps: mergeMapsInto,
  mergeCircularReferences: mergeCircularReferencesInto,
  mergeOthers: mergeOthersInto,
};

export { mergeArraysInto, mergeSetsInto, mergeOthersInto } from "./general.ts";
