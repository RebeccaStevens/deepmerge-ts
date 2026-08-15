import { actionsInto as actions } from "./actions.ts";
import { defaultFilterValues, defaultMetaDataUpdater, resolveCustomMergeFunctions } from "./defaults/general.ts";
import { type MergeFunctions, mergeIntoFunctions as defaultMergeIntoFunctions } from "./defaults/into.ts";
import type {
  DeepMergeBuiltInMetaData,
  DeepMergeFunctionsDefaultURIs,
  DeepMergeHKT,
  DeepMergeIntoOptions,
  DeepMergeIntoUtils,
  DeepMergeMetaData,
  DeepMergeMetaMetaData,
  DeepMergeValueReference,
  MetaDataUpdater,
} from "./types/index.ts";
import type { SimplifyObject } from "./types/utils.ts";
import { ObjectType, getCyclicReferenceDepth, getMetaDataHierarchy, getObjectType } from "./utils.ts";

const defaultDeepmergeInto = /** @__PURE__ */ deepmergeIntoCustom();

/**
 * Deeply merge objects into a target.
 *
 * @param target - This object will be mutated with the merge result.
 * @param objects - The objects to merge into the target.
 */
export function deepmergeInto<T extends object>(target: T, ...objects: ReadonlyArray<T>): void;

/**
 * Deeply merge objects into a target.
 *
 * @param target - This object will be mutated with the merge result.
 * @param objects - The objects to merge into the target.
 */
export function deepmergeInto<Target extends object, Ts extends ReadonlyArray<unknown>>(
  target: Target,
  ...objects: Ts
): asserts target is SimplifyObject<
  Target & DeepMergeHKT<[Target, ...Ts], DeepMergeFunctionsDefaultURIs, DeepMergeBuiltInMetaData>
>;

export function deepmergeInto<Target extends object, Ts extends ReadonlyArray<unknown>>(
  target: Target,
  ...objects: Ts
): asserts target is SimplifyObject<
  Target & DeepMergeHKT<[Target, ...Ts], DeepMergeFunctionsDefaultURIs, DeepMergeBuiltInMetaData>
> {
  return void defaultDeepmergeInto(target, ...objects);
}

/**
 * Used by the default `deepmergeInto` function.
 *
 * @internal
 */
export function deepmergeIntoCustom(): <Target extends object, Ts extends ReadonlyArray<unknown>>(
  target: Target,
  ...objects: Ts
) => void;

/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
export function deepmergeIntoCustom<BaseTs = unknown>(
  options: DeepMergeIntoOptions<DeepMergeBuiltInMetaData, DeepMergeMetaMetaData>,
): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(target: Target, ...objects: Ts) => void;

/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items being merged.
 */
export function deepmergeIntoCustom<
  BaseTs = unknown,
  MetaData extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MetaMetaData extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(
  options: DeepMergeIntoOptions<MetaData, MetaMetaData>,
  rootMetaData?: MetaData,
): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(target: Target, ...objects: Ts) => void;

export function deepmergeIntoCustom<
  BaseTs,
  MetaData extends DeepMergeMetaData,
  MetaMetaData extends DeepMergeMetaMetaData,
>(
  options: DeepMergeIntoOptions<MetaData, MetaMetaData> = {},
  rootMetaData?: MetaData,
): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(target: Target, ...objects: Ts) => void {
  const utils: DeepMergeIntoUtils<MetaData, MetaMetaData> = getUtils(options, customizedDeepmergeInto);

  /**
   * The customized deepmergeInto function.
   */
  function customizedDeepmergeInto<Target extends object, Ts extends ReadonlyArray<unknown>>(
    target: Target,
    ...objects: Ts
  ): void {
    mergeUnknownsInto<ReadonlyArray<unknown>, typeof utils, MetaData, MetaMetaData>(
      { value: target },
      [target, ...objects],
      utils,
      rootMetaData,
    );
  }

  return customizedDeepmergeInto;
}

/**
 * Get the utils that are available to the merge functions.
 *
 * @param options - The options the user specified.
 * @param customizedDeepmergeInto - The customized deepmergeInto function.
 */
function getUtils<M extends DeepMergeMetaData, MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData>(
  options: DeepMergeIntoOptions<M, MM>,
  customizedDeepmergeInto: DeepMergeIntoUtils<M, MM>["deepmergeInto"],
): DeepMergeIntoUtils<M, MM> {
  const defaultMergeFns = defaultMergeIntoFunctions as MergeFunctions<M, MM>;
  const defaultMetaDataUpd = defaultMetaDataUpdater as MetaDataUpdater<M, MM>;

  return {
    defaultMergeFunctions: defaultMergeFns,
    mergeFunctions: resolveCustomMergeFunctions(options, defaultMergeFns),
    metaDataUpdater: typeof options.metaDataUpdater === "function" ? options.metaDataUpdater : defaultMetaDataUpd,
    deepmergeInto: customizedDeepmergeInto,
    filterValues:
      options.filterValues === false
        ? undefined
        : typeof options.filterValues === "function"
          ? options.filterValues
          : defaultFilterValues,
    maxDepth:
      typeof options.maxDepth === "number" && !Number.isNaN(options.maxDepth) && options.maxDepth >= 0
        ? options.maxDepth
        : 1000,
    actions,
  };
}

/**
 * Merge unknown things into a target.
 *
 * @param mut_target - The target to merge into.
 * @param values - The values.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
export function mergeUnknownsInto<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(
  mut_target: DeepMergeValueReference<unknown>,
  values: Ts,
  utils: U,
  meta: M | undefined,
  // eslint-disable-next-line ts/no-invalid-void-type
): void | symbol {
  const filteredValues = utils.filterValues?.(values, meta) ?? values;

  if (filteredValues.length === 0) {
    return;
  }
  const hierarchy = getMetaDataHierarchy(meta);
  const currentDepth =
    hierarchy?.length ?? (typeof meta === "number" ? meta : ((meta as { depth?: number } | undefined)?.depth ?? 0));

  if (utils.maxDepth !== undefined && currentDepth >= utils.maxDepth) {
    return void mergeOthersInto<U, M, MM>(mut_target, filteredValues, utils, meta);
  }

  if (filteredValues.length === 1) {
    if (hierarchy !== undefined) {
      const depth = getCyclicReferenceDepth(filteredValues[0], hierarchy, 0);
      if (depth > 0) {
        mut_target.value =
          hierarchy[hierarchy.length - depth]?.result ?? hierarchy[hierarchy.length - depth]?.parents[0];
        return;
      }
    }
    return void mergeOthersInto<U, M, MM>(mut_target, filteredValues, utils, meta);
  }

  const type = getObjectType(mut_target.value);

  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    if (filteredValues.length === 2) {
      // Fast path: avoid dynamic array allocations and loop overhead for 2 elements.
      if (getObjectType(filteredValues[1]) !== type) {
        return void mergeOthersInto<U, M, MM>(mut_target, filteredValues, utils, meta);
      }
      const d0 = getCyclicReferenceDepth(filteredValues[0], hierarchy, 0);
      const d1 = getCyclicReferenceDepth(filteredValues[1], hierarchy, 1);
      if (d0 !== 0 || d1 !== 0) {
        return void mergeCircularReferencesInto<U, M, MM>(
          mut_target,
          filteredValues as ReadonlyArray<object>,
          utils,
          meta,
        );
      }
    } else {
      // Slow path: 3 or more elements require dynamic array allocations and full iteration.
      // eslint-disable-next-line unicorn/no-new-array -- We know the final length of the array.
      const cyclicDepths = new Array(filteredValues.length);
      cyclicDepths[0] = getCyclicReferenceDepth(filteredValues[0], hierarchy, 0);

      for (let mut_index = 1; mut_index < filteredValues.length; mut_index++) {
        if (getObjectType(filteredValues[mut_index]) !== type) {
          return void mergeOthersInto<U, M, MM>(mut_target, filteredValues, utils, meta);
        }

        cyclicDepths[mut_index] = getCyclicReferenceDepth(filteredValues[mut_index], hierarchy, mut_index);
      }

      if (cyclicDepths.some((depth) => depth !== 0)) {
        return void mergeCircularReferencesInto<U, M, MM>(
          mut_target,
          filteredValues as ReadonlyArray<object>,
          utils,
          meta,
        );
      }
    }
  }

  switch (type) {
    case ObjectType.RECORD: {
      return void mergeRecordsInto<U, M, MM>(
        mut_target as DeepMergeValueReference<Record<PropertyKey, unknown>>,
        filteredValues as ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
        utils,
        meta,
      );
    }

    case ObjectType.ARRAY: {
      return void mergeArraysInto<U, M, MM>(
        mut_target as DeepMergeValueReference<unknown[]>,
        filteredValues as ReadonlyArray<ReadonlyArray<unknown>>,
        utils,
        meta,
      );
    }

    case ObjectType.SET: {
      return void mergeSetsInto<U, M, MM>(
        mut_target as DeepMergeValueReference<Set<unknown>>,
        filteredValues as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils,
        meta,
      );
    }

    case ObjectType.MAP: {
      return void mergeMapsInto<U, M, MM>(
        mut_target as DeepMergeValueReference<Map<unknown, unknown>>,
        filteredValues as ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
        utils,
        meta,
      );
    }

    default: {
      return void mergeOthersInto<U, M, MM>(mut_target, filteredValues, utils, meta);
    }
  }
}

/**
 * Merge records into a target record.
 *
 * @param mut_target - The target to merge into.
 * @param values - The records.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeRecordsInto<
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(
  mut_target: DeepMergeValueReference<Record<PropertyKey, unknown>>,
  values: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const action = utils.mergeFunctions.mergeRecords(mut_target, values, utils, meta);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeRecords(mut_target, values, utils, meta);
  }
}

/**
 * Merge arrays into a target array.
 *
 * @param mut_target - The target to merge into.
 * @param values - The arrays.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeArraysInto<
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(
  mut_target: DeepMergeValueReference<unknown[]>,
  values: ReadonlyArray<ReadonlyArray<unknown>>,
  utils: U,
  meta: M | undefined,
) {
  const action = utils.mergeFunctions.mergeArrays(mut_target, values, utils, meta);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeArrays(mut_target, values);
  }
}

/**
 * Merge sets into a target set.
 *
 * @param mut_target - The target to merge into.
 * @param values - The sets.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeSetsInto<
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(
  mut_target: DeepMergeValueReference<Set<unknown>>,
  values: ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const action = utils.mergeFunctions.mergeSets(mut_target, values, utils, meta);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeSets(mut_target, values);
  }
}

/**
 * Merge maps into a target map.
 *
 * @param mut_target - The target to merge into.
 * @param values - The maps.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeMapsInto<
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(
  mut_target: DeepMergeValueReference<Map<unknown, unknown>>,
  values: ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const action = utils.mergeFunctions.mergeMaps(mut_target, values, utils, meta);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeMaps(mut_target, values, utils, meta);
  }
}

/**
 * Merge circular references into a target.
 *
 * @param mut_target - The target to merge into.
 * @param values - The circular references.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeCircularReferencesInto<
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(mut_target: DeepMergeValueReference<unknown>, values: ReadonlyArray<object>, utils: U, meta: M | undefined) {
  const action = utils.mergeFunctions.mergeCircularReferences(mut_target, values, utils, meta);

  if (action === actions.defaultMerge || mut_target.value === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeCircularReferences(mut_target, values, utils, meta);
  }
}

/**
 * Merge other things into a target.
 *
 * @param mut_target - The target to merge into.
 * @param values - The other things.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeOthersInto<
  U extends DeepMergeIntoUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(mut_target: DeepMergeValueReference<unknown>, values: ReadonlyArray<unknown>, utils: U, meta: M | undefined) {
  const action = utils.mergeFunctions.mergeOthers(mut_target, values, utils, meta);

  if (action === actions.defaultMerge || mut_target.value === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeOthers(mut_target, values);
  }
}
