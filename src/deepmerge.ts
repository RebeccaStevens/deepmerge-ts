import { actions } from "./actions.ts";
import { defaultFilterValues, defaultMetaDataUpdater } from "./defaults/general.ts";
import { mergeFunctions as defaultMergeFunctions } from "./defaults/vanilla.ts";
import type {
  DeepMergeFunctionsDefaultURIs,
  DeepMergeFunctionsURIs,
  DeepMergeHKT,
  DeepMergeMetaData,
  DeepMergeMetaMetaData,
  DeepMergeOptions,
  DeepMergeRootMetaData,
  DeepMergeUtils,
  GetDeepMergeFunctionsURIs,
} from "./types/index.ts";
import { ObjectType, getCyclicReferenceDepth, getObjectType } from "./utils.ts";

/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
export function deepmerge<Ts extends Readonly<ReadonlyArray<unknown>>>(
  ...objects: readonly [...Ts]
): DeepMergeHKT<Ts, DeepMergeFunctionsDefaultURIs, DeepMergeMetaMetaData> {
  return deepmergeCustom()(...objects);
}

/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
export function deepmergeCustom<BaseTs = unknown, PMF extends Partial<DeepMergeFunctionsURIs> = {}>(
  options: DeepMergeOptions<DeepMergeMetaData, DeepMergeMetaMetaData>,
): <Ts extends ReadonlyArray<BaseTs>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, DeepMergeMetaMetaData>;

/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items' being merged.
 */
export function deepmergeCustom<
  BaseTs = unknown,
  PMF extends Partial<DeepMergeFunctionsURIs> = {},
  MetaData extends DeepMergeMetaData = DeepMergeMetaData,
  MetaMetaData extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(
  options: DeepMergeOptions<MetaData, MetaMetaData>,

  rootMetaData?: MetaData,
): <Ts extends ReadonlyArray<BaseTs>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData>;

/**
 * Used by the default `deepmerge` function.
 *
 * @internal
 */
export function deepmergeCustom(): <Ts extends ReadonlyArray<unknown>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, DeepMergeFunctionsDefaultURIs, DeepMergeMetaMetaData>;

export function deepmergeCustom<
  BaseTs,
  PMF extends Partial<DeepMergeFunctionsURIs>,
  MetaData extends DeepMergeMetaData,
  MetaMetaData extends DeepMergeMetaMetaData,
>(
  options?: DeepMergeOptions<MetaData, MetaMetaData>,
  rootMetaData?: MetaData,
): <Ts extends ReadonlyArray<BaseTs>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData> {
  /**
   * The type of the customized deepmerge function.
   */
  type CustomizedDeepmerge = <Ts extends ReadonlyArray<unknown>>(
    ...objects: Ts
  ) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData>;

  const utils: DeepMergeUtils<MetaData, MetaMetaData> = getUtils(options, customizedDeepmerge as CustomizedDeepmerge);

  /**
   * The customized deepmerge function.
   */
  function customizedDeepmerge(...objects: ReadonlyArray<unknown>) {
    return mergeUnknowns<ReadonlyArray<unknown>, typeof utils, GetDeepMergeFunctionsURIs<PMF>, MetaData, MetaMetaData>(
      objects,
      utils,
      rootMetaData ?? (undefined satisfies DeepMergeRootMetaData as unknown as MetaData),
    );
  }

  return customizedDeepmerge as CustomizedDeepmerge;
}

/**
 * The the utils that are available to the merge functions.
 *
 * @param options - The options the user specified
 */
function getUtils<M extends DeepMergeMetaData, MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData>(
  options: DeepMergeOptions<M, MM> | undefined,
  customizedDeepmerge: DeepMergeUtils<M, MM>["deepmerge"],
): DeepMergeUtils<M, MM> {
  if (options === undefined) {
    return {
      defaultMergeFunctions,
      mergeFunctions: defaultMergeFunctions as DeepMergeUtils<M, MM>["mergeFunctions"],
      metaDataUpdater: defaultMetaDataUpdater as DeepMergeUtils<M, MM>["metaDataUpdater"],
      deepmerge: customizedDeepmerge,
      useImplicitDefaultMerging: false,
      filterValues: defaultFilterValues,
      actions,
    };
  }

  return {
    defaultMergeFunctions,
    mergeFunctions: {
      ...defaultMergeFunctions,
      ...Object.fromEntries(
        Object.entries(options)
          .filter(([key, option]) => Object.hasOwn(defaultMergeFunctions, key))
          .map(([key, option]) => (option === false ? [key, defaultMergeFunctions.mergeOthers] : [key, option])),
      ),
    } as DeepMergeUtils<M, MM>["mergeFunctions"],
    metaDataUpdater: (options.metaDataUpdater ?? defaultMetaDataUpdater) as unknown as DeepMergeUtils<
      M,
      MM
    >["metaDataUpdater"],
    deepmerge: customizedDeepmerge,
    useImplicitDefaultMerging: options.enableImplicitDefaultMerging ?? false,
    filterValues: options.filterValues === false ? undefined : (options.filterValues ?? defaultFilterValues),
    actions,
  };
}

/**
 * Merge unknown things.
 */
export function mergeUnknowns<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils: U, meta: M): DeepMergeHKT<Ts, Fs, M> {
  const filteredValues = utils.filterValues?.(values, meta) ?? values;

  if (filteredValues.length === 0) {
    return undefined as DeepMergeHKT<Ts, Fs, M>;
  }
  if (filteredValues.length === 1) {
    return mergeOthers<U, Fs, M, MM>(filteredValues, utils, meta) as DeepMergeHKT<Ts, Fs, M>;
  }

  const type = getObjectType(filteredValues[0]);

  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    // eslint-disable-next-line unicorn/no-new-array -- We known the final length of the array.
    const cyclicDepths = new Array(filteredValues.length);
    cyclicDepths[0] = getCyclicReferenceDepth(values[0], meta?.hierarchy, 0);

    for (let mut_index = 1; mut_index < filteredValues.length; mut_index++) {
      // If the object types are different, then we can't merge them.
      if (getObjectType(filteredValues[mut_index]) !== type) {
        return mergeOthers<U, Fs, M, MM>(filteredValues, utils, meta) as DeepMergeHKT<Ts, Fs, M>;
      }

      // Check if the object is a cyclic reference.
      cyclicDepths[mut_index] = getCyclicReferenceDepth(filteredValues[mut_index], meta?.hierarchy, mut_index);
    }

    if (cyclicDepths.some((depth) => depth !== 0)) {
      return mergeCircularReferences<U, Fs, M, MM>(filteredValues, cyclicDepths, utils, meta) as DeepMergeHKT<
        Ts,
        Fs,
        M
      >;
    }
  }

  switch (type) {
    case ObjectType.RECORD: {
      return mergeRecords<U, Fs, M, MM>(
        filteredValues as ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.ARRAY: {
      return mergeArrays<U, Fs, M, MM>(
        filteredValues as ReadonlyArray<Readonly<ReadonlyArray<unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.SET: {
      return mergeSets<U, Fs, M, MM>(
        filteredValues as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.MAP: {
      return mergeMaps<U, Fs, M, MM>(
        filteredValues as ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    default: {
      return mergeOthers<U, Fs, M, MM>(filteredValues, utils, meta) as DeepMergeHKT<Ts, Fs, M>;
    }
  }
}

/**
 * Merge records.
 *
 * @param values - The records.
 */
function mergeRecords<
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeRecords(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeRecords !== utils.defaultMergeFunctions.mergeRecords)
  ) {
    return utils.defaultMergeFunctions.mergeRecords<typeof values, U, Fs, M, MM>(values, utils, meta);
  }

  return result;
}

/**
 * Merge arrays.
 *
 * @param values - The arrays.
 */
function mergeArrays<
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<Readonly<ReadonlyArray<unknown>>>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeArrays(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeArrays !== utils.defaultMergeFunctions.mergeArrays)
  ) {
    return utils.defaultMergeFunctions.mergeArrays<typeof values, U, Fs, M, MM>(values, utils, meta);
  }
  return result;
}

/**
 * Merge sets.
 *
 * @param values - The sets.
 */
function mergeSets<
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<Readonly<ReadonlySet<unknown>>>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeSets(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeSets !== utils.defaultMergeFunctions.mergeSets)
  ) {
    return utils.defaultMergeFunctions.mergeSets<typeof values, U, Fs, M, MM>(values, utils, meta);
  }
  return result;
}

/**
 * Merge maps.
 *
 * @param values - The maps.
 */
function mergeMaps<
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeMaps(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeMaps !== utils.defaultMergeFunctions.mergeMaps)
  ) {
    return utils.defaultMergeFunctions.mergeMaps<typeof values, U, Fs, M, MM>(values, utils, meta);
  }
  return result;
}

/**
 * Merge circular references.
 *
 * @param values - The circular references.
 */
function mergeCircularReferences<
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<unknown>, cyclicDepths: ReadonlyArray<number>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeCircularReferences(values, cyclicDepths, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeCircularReferences !== utils.defaultMergeFunctions.mergeCircularReferences)
  ) {
    return utils.defaultMergeFunctions.mergeCircularReferences<typeof values, U, Fs, M, MM>(
      values,
      cyclicDepths,
      utils,
      meta,
    );
  }
  return result;
}

/**
 * Merge other things.
 *
 * @param values - The other things.
 */
function mergeOthers<
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<unknown>, utils: U, meta: M) {
  const result = utils.mergeFunctions.mergeOthers(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeOthers !== utils.defaultMergeFunctions.mergeOthers)
  ) {
    return utils.defaultMergeFunctions.mergeOthers<typeof values, U, Fs, M, MM>(values, utils, meta);
  }
  return result;
}
