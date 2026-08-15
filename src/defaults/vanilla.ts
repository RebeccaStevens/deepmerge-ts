import { actions } from "../actions.ts";
import { mergeUnknowns } from "../deepmerge.ts";
import type {
  DeepMergeCircularReferencesDefaultHKT,
  DeepMergeFunctionsURIs,
  DeepMergeMapsDefaultHKT,
  DeepMergeMergeInfo,
  DeepMergeMetaData,
  DeepMergeRecordsDefaultHKT,
  DeepMergeUtils,
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

import { mergeArrays, mergeOthers, mergeSets } from "./general.ts";

/**
 * The default merge functions.
 */
export type MergeFunctions<
  M extends DeepMergeMetaData = DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
> = {
  mergeRecords: <
    Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
    U extends DeepMergeUtils<M, MI>,
    Fs extends DeepMergeFunctionsURIs,
  >(
    values: Ts,
    utils: U,
    meta: M,
  ) => DeepMergeRecordsDefaultHKT<Ts, Fs, M>;
  mergeArrays: typeof mergeArrays;
  mergeSets: typeof mergeSets;
  mergeMaps: <
    Ts extends ReadonlyArray<ReadonlyMap<unknown, unknown>>,
    U extends DeepMergeUtils<M, MI>,
    // eslint-disable-next-line ts/no-unused-vars
    Fs extends DeepMergeFunctionsURIs,
  >(
    values: Ts,
    utils: U,
    meta: M,
  ) => DeepMergeMapsDefaultHKT<Ts>;
  mergeCircularReferences: <
    Ts extends ReadonlyArray<unknown>,
    U extends DeepMergeUtils<M, MI>,
    Fs extends DeepMergeFunctionsURIs,
  >(
    values: Ts,
    cyclicDepths: ReadonlyArray<number>,
    utils: U,
    meta: M,
  ) => DeepMergeCircularReferencesDefaultHKT<Ts, Fs, M>;
  mergeOthers: typeof mergeOthers;
};

/**
 * The default strategy to merge records.
 *
 * @param values - The records.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeRecords<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeUtils<M, MI>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: Ts, utils: U, meta: M): DeepMergeRecordsDefaultHKT<Ts, Fs, M> {
  if (values.length === 2) {
    const result: Record<PropertyKey, unknown> = {};

    // Fast path for 2 records: avoid building a union key set and per-key value
    // arrays. Only the keys present in each record are iterated.
    const mergeProperty = (key: PropertyKey, propValues: unknown[]) => {
      const updatedMeta = utils.metaDataUpdater(meta, {
        key,
        parents: values,
        values: propValues,
        result,
      } satisfies DeepMergeMergeInfo as unknown as Partial<MI>);

      const propertyResult = mergeUnknowns<ReadonlyArray<unknown>, U, Fs, M, MI>(propValues, utils, updatedMeta);

      if (propertyResult === actions.skip) {
        return;
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

    return result as DeepMergeRecordsDefaultHKT<Ts, Fs, M>;
  }
  return mergeRecordsGeneral<Ts, U, Fs, M, MI>(values, utils, meta);
}

/**
 * The default strategy to merge 3 or more records.
 *
 * @param values - The records.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeRecordsGeneral<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeUtils<M, MI>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: Ts, utils: U, meta: M): DeepMergeRecordsDefaultHKT<Ts, Fs, M> {
  const result: Record<PropertyKey, unknown> = {};

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
      result,
    } satisfies DeepMergeMergeInfo as unknown as Partial<MI>);

    const propertyResult = mergeUnknowns<ReadonlyArray<unknown>, U, Fs, M, MI>(propValues, utils, updatedMeta);

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
 * The default strategy to merge maps.
 *
 * @param values - The maps.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeMaps<
  Ts extends ReadonlyArray<ReadonlyMap<unknown, unknown>>,
  U extends DeepMergeUtils<M, MI>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: Ts, utils: U, meta: M): DeepMergeMapsDefaultHKT<Ts> {
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
    const updatedMeta = utils.metaDataUpdater(meta, {
      key,
      parents: values,
      values: keyValues,
      result,
    } satisfies DeepMergeMergeInfo as unknown as Partial<MI>);

    const keyResult = mergeUnknowns<ReadonlyArray<unknown>, U, Fs, M, MI>(keyValues, utils, updatedMeta);

    if (keyResult === actions.skip) {
      continue;
    }

    result.set(key, keyResult);
  }

  return result as DeepMergeMapsDefaultHKT<Ts>;
}

/**
 * Resolve any cyclic references within a non-cyclic object pointing to ancestors in meta.hierarchy.
 *
 * @param value - The value to resolve circular references for.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function resolveCyclicReferences<
  U extends DeepMergeUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(value: unknown, utils: U, meta: M): unknown {
  if (typeof value !== "object" || value === null) {
    return value;
  }
  const hierarchy = getMetaDataHierarchy(meta);
  const depth = getCyclicReferenceDepth(value, hierarchy, 0);
  if (depth > 0 && hierarchy !== undefined) {
    return hierarchy[hierarchy.length - depth]?.result;
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
      const resolvedProp = resolveCyclicReferences<U, M, MI>(propVal, utils, updatedMeta);
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
 * The default strategy to merge circular references.
 *
 * @param values - The circular references.
 * @param cyclicDepths - The depth of each circular reference.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeCircularReferences<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeUtils<M, MI>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(
  values: Ts,
  cyclicDepths: ReadonlyArray<number>,
  utils: U,
  meta: M,
): DeepMergeCircularReferencesDefaultHKT<Ts, Fs, M> {
  const depth = cyclicDepths[0]!;
  const hierarchy = getMetaDataHierarchy(meta);
  for (let mut_index = 1; mut_index < values.length; mut_index++) {
    if (cyclicDepths[mut_index] !== depth) {
      const lastCyclicDepth = cyclicDepths.at(-1)!;
      return (
        lastCyclicDepth === 0
          ? resolveCyclicReferences<U, M, MI>(values.at(-1), utils, meta)
          : hierarchy?.[hierarchy.length - lastCyclicDepth]?.result
      ) as DeepMergeCircularReferencesDefaultHKT<Ts, Fs, M>;
    }
  }
  return hierarchy?.[hierarchy.length - depth]?.result as DeepMergeCircularReferencesDefaultHKT<Ts, Fs, M>;
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

export { mergeArrays, mergeSets, mergeOthers } from "./general.ts";
