import { mergeUnknownsInto } from "../deepmerge-into.ts";
import type {
  DeepMergeIntoUtils,
  DeepMergeMergeInfo,
  DeepMergeMetaData,
  DeepMergeValueReference,
} from "../types/index.ts";
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
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
> = {
  mergeRecords: <Ts extends ReadonlyArray<Record<PropertyKey, unknown>>, U extends DeepMergeIntoUtils<M, MI>>(
    mut_target: DeepMergeValueReference<Record<PropertyKey, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => void;
  mergeArrays: typeof mergeArraysInto;
  mergeSets: typeof mergeSetsInto;
  mergeMaps: <Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, U extends DeepMergeIntoUtils<M, MI>>(
    mut_target: DeepMergeValueReference<Map<unknown, unknown>>,
    values: Ts,
    utils: U,
    meta: M | undefined,
  ) => void;
  mergeCircularReferences: <Ts extends ReadonlyArray<object>, U extends DeepMergeIntoUtils<M, MI>>(
    mut_target: DeepMergeValueReference<unknown>,
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
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<Record<PropertyKey, unknown>>, values: Ts, utils: U, meta: M | undefined): void {
  if (values.length === 2) {
    // Fast path for 2 records: avoid building a union key set and per-key value
    // arrays. Only the keys present in each record are iterated.
    const mergeProperty = (key: PropertyKey, propValues: unknown[]) => {
      const updatedMeta = utils.metaDataUpdater(meta, {
        key,
        parents: values,
        values: propValues,
        result: mut_target.value,
      } satisfies DeepMergeMergeInfo as unknown as Partial<MI>);

      const propertyTarget: DeepMergeValueReference<unknown> = { value: propValues[0] };
      mergeUnknownsInto<ReadonlyArray<unknown>, U, M, MI>(propertyTarget, propValues, utils, updatedMeta);

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
  mergeRecordsIntoGeneral<Ts, U, M, MI>(mut_target, values, utils, meta);
}

/**
 * The default strategy to merge 3 or more records into a target record.
 *
 * @param mut_target - The target to merge into.
 * @param values - The records (including the target's value if there is one).
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeRecordsIntoGeneral<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<Record<PropertyKey, unknown>>, values: Ts, utils: U, meta: M | undefined): void {
  for (const key of getKeysOfObjects(values)) {
    const propValues = [];

    for (const value of values) {
      if (objectHasProperty(value, key)) {
        propValues.push(value[key]);
      }
    }

    const updatedMeta = utils.metaDataUpdater(meta, {
      key,
      parents: values,
      values: propValues,
      result: mut_target.value,
    } satisfies DeepMergeMergeInfo as unknown as Partial<MI>);

    const propertyTarget: DeepMergeValueReference<unknown> = { value: propValues[0] };
    mergeUnknownsInto<ReadonlyArray<unknown>, U, M, MI>(propertyTarget, propValues, utils, updatedMeta);

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
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<Map<unknown, unknown>>, values: Ts, utils: U, meta: M | undefined): void {
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
    } satisfies DeepMergeMergeInfo as unknown as Partial<MI>);

    const propTarget: DeepMergeValueReference<unknown> = { value: allValues[0] };
    mergeUnknownsInto<ReadonlyArray<unknown>, U, M, MI>(propTarget, allValues, utils, updatedMeta);

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
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
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
      } satisfies DeepMergeMergeInfo as unknown as Partial<MI>);
      const resolvedProp = resolveCyclicReferencesInto<U, M, MI>(propVal, utils, updatedMeta);
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
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<unknown>, values: Ts, utils: U, meta: M | undefined): void {
  const hierarchy = getMetaDataHierarchy(meta);
  const cyclicDepths = values.map((v, i) => getCyclicReferenceDepth(v, hierarchy, i));
  const depth = cyclicDepths[0]!;
  for (let mut_index = 1; mut_index < values.length; mut_index++) {
    if (cyclicDepths[mut_index] !== depth) {
      const lastCyclicDepth = cyclicDepths.at(-1)!;
      mut_target.value =
        lastCyclicDepth === 0
          ? resolveCyclicReferencesInto<U, M, MI>(values.at(-1), utils, meta)
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
