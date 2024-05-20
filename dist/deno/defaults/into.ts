import { mergeUnknownsInto } from "../deepmerge-into.ts";
import {
  type DeepMergeBuiltInMetaData,
  type DeepMergeMergeIntoFunctionUtils,
  type Reference,
} from "../types/index.ts";
import { getIterableOfIterables, getKeys, objectHasProperty } from "../utils.ts";

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
 * The default strategy to merge records into a target record.
 *
 * @param m_target - The result will be mutated into this record
 * @param values - The records (including the target's value if there is one).
 */
export function mergeRecords<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeMergeIntoFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  m_target: Reference<Record<PropertyKey, unknown>>,
  values: Ts,
  utils: U,
  meta: M | undefined,
): void {
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
    mergeUnknownsInto<ReadonlyArray<unknown>, U, M, MM>(
      propertyTarget,
      propValues,
      utils,
      updatedMeta,
    );

    if (key === "__proto__") {
      Object.defineProperty(m_target.value, key, {
        value: propertyTarget.value,
        configurable: true,
        enumerable: true,
        writable: true,
      });
    } else {
      m_target.value[key] = propertyTarget.value;
    }
  }
}

/**
 * The default strategy to merge arrays into a target array.
 *
 * @param m_target - The result will be mutated into this array
 * @param values - The arrays (including the target's value if there is one).
 */
export function mergeArrays<Ts extends ReadonlyArray<ReadonlyArray<unknown>>>(
  m_target: Reference<unknown[]>,
  values: Ts,
): void {
  m_target.value.push(...values.slice(1).flat());
}

/**
 * The default strategy to merge sets into a target set.
 *
 * @param m_target - The result will be mutated into this set
 * @param values - The sets (including the target's value if there is one).
 */
export function mergeSets<
  Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
>(m_target: Reference<Set<unknown>>, values: Ts): void {
  for (const value of getIterableOfIterables(values.slice(1))) {
    m_target.value.add(value);
  }
}

/**
 * The default strategy to merge maps into a target map.
 *
 * @param m_target - The result will be mutated into this map
 * @param values - The maps (including the target's value if there is one).
 */
export function mergeMaps<
  Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
>(m_target: Reference<Map<unknown, unknown>>, values: Ts): void {
  for (const [key, value] of getIterableOfIterables(values.slice(1))) {
    m_target.value.set(key, value);
  }
}

/**
 * Set the target to the last non-undefined value.
 */
export function mergeOthers<Ts extends ReadonlyArray<unknown>>(
  m_target: Reference<unknown>,
  values: Ts,
) {
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i] !== undefined) {
      m_target.value = values[i];
      return;
    }
  }
  m_target.value = undefined;
}
