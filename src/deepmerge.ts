import { actions } from "./actions.ts";
import {
  defaultFilterValues,
  defaultMetaDataUpdater,
  resolveCustomMergeFunctions,
  shouldFallbackToDefault,
} from "./defaults/general.ts";
import { type MergeFunctions, mergeFunctions as defaultMergeFunctions } from "./defaults/vanilla.ts";
import type {
  DeepMergeBuiltInMetaData,
  DeepMergeFunctionsDefaultURIs,
  DeepMergeFunctionsURIs,
  DeepMergeHKT,
  DeepMergeMergeInfo,
  DeepMergeMetaData,
  DeepMergeOptions,
  DeepMergeUtils,
  GetDeepMergeFunctionsURIs,
  MetaDataUpdater,
} from "./types/index.ts";
import { ObjectType, getCyclicReferenceDepth, getMetaDataHierarchy, getObjectType } from "./utils.ts";

const defaultDeepmerge = /** @__PURE__ */ deepmergeCustom();

/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
export function deepmerge<Ts extends Readonly<ReadonlyArray<unknown>>>(
  ...objects: readonly [...Ts]
): DeepMergeHKT<Ts, DeepMergeFunctionsDefaultURIs, DeepMergeBuiltInMetaData> {
  return defaultDeepmerge(...objects);
}

/**
 * Used by the default `deepmerge` function.
 *
 * @internal
 */
export function deepmergeCustom(): <Ts extends ReadonlyArray<unknown>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, DeepMergeFunctionsDefaultURIs, DeepMergeBuiltInMetaData>;

/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
export function deepmergeCustom<BaseTs = unknown, PMF extends Partial<DeepMergeFunctionsURIs> = {}>(
  options: DeepMergeOptions<DeepMergeBuiltInMetaData, DeepMergeMergeInfo>,
): <Ts extends ReadonlyArray<BaseTs>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, DeepMergeBuiltInMetaData>;

/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items being merged.
 * @example
 * ```ts
 * import { deepmergeCustom } from "deepmerge-ts";
 *
 * // Merge arrays by concatenation instead of last-wins.
 * const merge = deepmergeCustom({
 *   mergeArrays: (values) => values.flat(),
 * });
 *
 * const result = merge({ tags: ["a"] }, { tags: ["b"] });
 * // => { tags: ["a", "b"] }
 * ```
 */
export function deepmergeCustom<
  BaseTs = unknown,
  PMF extends Partial<DeepMergeFunctionsURIs> = {},
  MetaData extends DeepMergeMetaData = DeepMergeBuiltInMetaData,
  MetaMetaData extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(
  options: DeepMergeOptions<MetaData, MetaMetaData>,

  rootMetaData?: MetaData,
): <Ts extends ReadonlyArray<BaseTs>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData>;

export function deepmergeCustom<
  BaseTs,
  PMF extends Partial<DeepMergeFunctionsURIs>,
  MetaData extends DeepMergeMetaData,
  MetaMetaData extends DeepMergeMergeInfo,
>(
  options: DeepMergeOptions<MetaData, MetaMetaData> = {},
  rootMetaData?: MetaData,
): <Ts extends ReadonlyArray<BaseTs>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData> {
  const utils: DeepMergeUtils<MetaData, MetaMetaData> = getUtils(options, customizedDeepmerge);

  /**
   * The customized deepmerge function.
   */
  function customizedDeepmerge<Ts extends ReadonlyArray<unknown>>(
    ...objects: Ts
  ): DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData> {
    return mergeUnknowns<Ts, typeof utils, GetDeepMergeFunctionsURIs<PMF>, MetaData, MetaMetaData>(
      objects,
      utils,
      rootMetaData ?? (undefined as MetaData),
    );
  }

  return customizedDeepmerge;
}

/**
 * Get the utils that are available to the merge functions.
 *
 * @param options - The options the user specified.
 * @param customizedDeepmerge - The customized deepmerge function.
 */
function getUtils<M extends DeepMergeMetaData, MI extends DeepMergeMergeInfo = DeepMergeMergeInfo>(
  options: DeepMergeOptions<M, MI>,
  customizedDeepmerge: DeepMergeUtils<M, MI>["deepmerge"],
): DeepMergeUtils<M, MI> {
  const defaultMergeFns = defaultMergeFunctions as MergeFunctions<M, MI>;
  const defaultMetaDataUpd = defaultMetaDataUpdater as MetaDataUpdater<M, MI>;

  return {
    defaultMergeFunctions: defaultMergeFns,
    mergeFunctions: resolveCustomMergeFunctions(options, defaultMergeFns) as DeepMergeUtils<M, MI>["mergeFunctions"],
    metaDataUpdater: typeof options.metaDataUpdater === "function" ? options.metaDataUpdater : defaultMetaDataUpd,
    deepmerge: customizedDeepmerge,
    useImplicitDefaultMerging: options.enableImplicitDefaultMerging ?? false,
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
 * Merge unknown things.
 *
 * @param values - The values.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
export function mergeUnknowns<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeUtils<M, MI>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: Ts, utils: U, meta: M): DeepMergeHKT<Ts, Fs, M> {
  const filteredValues = utils.filterValues?.(values, meta) ?? values;

  if (filteredValues.length === 0) {
    return undefined as DeepMergeHKT<Ts, Fs, M>;
  }

  const hierarchy = getMetaDataHierarchy(meta);
  const currentDepth =
    hierarchy?.length ?? (typeof meta === "number" ? meta : ((meta as { depth?: number } | undefined)?.depth ?? 0));

  if (utils.maxDepth !== undefined && currentDepth >= utils.maxDepth) {
    return mergeOthers<U, M, MI>(filteredValues, utils, meta) as DeepMergeHKT<Ts, Fs, M>;
  }

  if (filteredValues.length === 1) {
    if (hierarchy !== undefined) {
      const depth = getCyclicReferenceDepth(filteredValues[0], hierarchy, 0);
      if (depth > 0) {
        return (hierarchy[hierarchy.length - depth]?.result ??
          hierarchy[hierarchy.length - depth]?.parents[0]) as DeepMergeHKT<Ts, Fs, M>;
      }
    }
    return mergeOthers<U, M, MI>(filteredValues, utils, meta) as DeepMergeHKT<Ts, Fs, M>;
  }

  const type = getObjectType(filteredValues[0]);

  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    if (filteredValues.length === 2) {
      // Fast path: avoid dynamic array allocations and loop overhead for 2 elements.
      if (getObjectType(filteredValues[1]) !== type) {
        return mergeOthers<U, M, MI>(filteredValues, utils, meta) as DeepMergeHKT<Ts, Fs, M>;
      }
      const d0 = getCyclicReferenceDepth(filteredValues[0], hierarchy, 0);
      const d1 = getCyclicReferenceDepth(filteredValues[1], hierarchy, 1);
      if (d0 !== 0 || d1 !== 0) {
        return mergeCircularReferences<U, M, MI>(filteredValues, [d0, d1], utils, meta) as DeepMergeHKT<Ts, Fs, M>;
      }
    } else {
      // Slow path: 3 or more elements require dynamic array allocations and full iteration.
      // eslint-disable-next-line unicorn/no-new-array -- We know the final length of the array.
      const cyclicDepths = new Array(filteredValues.length);
      cyclicDepths[0] = getCyclicReferenceDepth(filteredValues[0], hierarchy, 0);

      for (let mut_index = 1; mut_index < filteredValues.length; mut_index++) {
        // If the object types are different, then we can't merge them.
        if (getObjectType(filteredValues[mut_index]) !== type) {
          return mergeOthers<U, M, MI>(filteredValues, utils, meta) as DeepMergeHKT<Ts, Fs, M>;
        }

        // Check if the object is a cyclic reference.
        cyclicDepths[mut_index] = getCyclicReferenceDepth(filteredValues[mut_index], hierarchy, mut_index);
      }

      if (cyclicDepths.some((depth) => depth !== 0)) {
        return mergeCircularReferences<U, M, MI>(filteredValues, cyclicDepths, utils, meta) as DeepMergeHKT<Ts, Fs, M>;
      }
    }
  }

  switch (type) {
    case ObjectType.RECORD: {
      return mergeRecords<U, M, MI>(
        filteredValues as ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.ARRAY: {
      return mergeArrays<U, M, MI>(
        filteredValues as ReadonlyArray<Readonly<ReadonlyArray<unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.SET: {
      return mergeSets<U, M, MI>(
        filteredValues as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.MAP: {
      return mergeMaps<U, M, MI>(
        filteredValues as ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    default: {
      return mergeOthers<U, M, MI>(filteredValues, utils, meta) as DeepMergeHKT<Ts, Fs, M>;
    }
  }
}

/**
 * Merge records.
 *
 * @param values - The records.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeRecords<
  U extends DeepMergeUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeRecords(values, utils, meta);
  if (shouldFallbackToDefault(utils, "mergeRecords", result)) {
    return utils.defaultMergeFunctions.mergeRecords(values, utils, meta);
  }
  return result;
}

/**
 * Merge arrays.
 *
 * @param values - The arrays.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeArrays<
  U extends DeepMergeUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: ReadonlyArray<Readonly<ReadonlyArray<unknown>>>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeArrays(values, utils, meta);
  if (shouldFallbackToDefault(utils, "mergeArrays", result)) {
    return utils.defaultMergeFunctions.mergeArrays(values);
  }
  return result;
}

/**
 * Merge sets.
 *
 * @param values - The sets.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeSets<
  U extends DeepMergeUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: ReadonlyArray<Readonly<ReadonlySet<unknown>>>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeSets(values, utils, meta);
  if (shouldFallbackToDefault(utils, "mergeSets", result)) {
    return utils.defaultMergeFunctions.mergeSets(values);
  }
  return result;
}

/**
 * Merge maps.
 *
 * @param values - The maps.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeMaps<
  U extends DeepMergeUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeMaps(values, utils, meta);
  if (shouldFallbackToDefault(utils, "mergeMaps", result)) {
    return utils.defaultMergeFunctions.mergeMaps(values, utils, meta);
  }
  return result;
}

/**
 * Merge circular references.
 *
 * @param values - The circular references.
 * @param cyclicDepths - The depth of each circular reference.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeCircularReferences<
  U extends DeepMergeUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: ReadonlyArray<unknown>, cyclicDepths: ReadonlyArray<number>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeCircularReferences(values, cyclicDepths, utils, meta);
  if (shouldFallbackToDefault(utils, "mergeCircularReferences", result)) {
    return utils.defaultMergeFunctions.mergeCircularReferences(values, cyclicDepths, utils, meta);
  }
  return result;
}

/**
 * Merge other things.
 *
 * @param values - The other things.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
function mergeOthers<
  U extends DeepMergeUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(values: ReadonlyArray<unknown>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeOthers(values, utils, meta);
  if (shouldFallbackToDefault(utils, "mergeOthers", result)) {
    return utils.defaultMergeFunctions.mergeOthers(values);
  }
  return result;
}
