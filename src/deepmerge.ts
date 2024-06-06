import { actions } from "./actions";
import {
  defaultFilterValues,
  defaultMetaDataUpdater,
} from "./defaults/general";
import { mergeFunctions as defaultMergeFunctions } from "./defaults/vanilla";
import {
  type DeepMergeBuiltInMetaData,
  type DeepMergeFunctionsDefaultURIs,
  type DeepMergeFunctionsURIs,
  type DeepMergeHKT,
  type DeepMergeOptions,
  type DeepMergeUtils,
  type GetDeepMergeFunctionsURIs,
} from "./types";
import { ObjectType, getObjectType } from "./utils";

/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
export function deepmerge<Ts extends Readonly<ReadonlyArray<unknown>>>(
  ...objects: readonly [...Ts]
): DeepMergeHKT<Ts, DeepMergeFunctionsDefaultURIs, DeepMergeBuiltInMetaData> {
  return deepmergeCustom({})(...objects) as DeepMergeHKT<
    Ts,
    DeepMergeFunctionsDefaultURIs,
    DeepMergeBuiltInMetaData
  >;
}

/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
export function deepmergeCustom<
  BaseTs = unknown,
  PMF extends Partial<DeepMergeFunctionsURIs> = {},
>(
  options: DeepMergeOptions<DeepMergeBuiltInMetaData, DeepMergeBuiltInMetaData>,
): <Ts extends ReadonlyArray<BaseTs>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, DeepMergeBuiltInMetaData>;

/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items' being merged.
 */
export function deepmergeCustom<
  BaseTs = unknown,
  PMF extends Partial<DeepMergeFunctionsURIs> = {},
  MetaData = DeepMergeBuiltInMetaData,
  MetaMetaData extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  options: DeepMergeOptions<MetaData, MetaMetaData>,
  rootMetaData?: MetaData,
): <Ts extends ReadonlyArray<BaseTs>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData>;

export function deepmergeCustom<
  BaseTs,
  PMF extends Partial<DeepMergeFunctionsURIs>,
  MetaData,
  MetaMetaData extends DeepMergeBuiltInMetaData,
>(
  options: DeepMergeOptions<MetaData, MetaMetaData>,
  rootMetaData?: MetaData,
): <Ts extends ReadonlyArray<BaseTs>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData> {
  /**
   * The type of the customized deepmerge function.
   */
  type CustomizedDeepmerge = <Ts extends ReadonlyArray<unknown>>(
    ...objects: Ts
  ) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, MetaData>;

  const utils: DeepMergeUtils<MetaData, MetaMetaData> = getUtils(
    options,
    customizedDeepmerge as CustomizedDeepmerge,
  );

  /**
   * The customized deepmerge function.
   */
  function customizedDeepmerge(...objects: ReadonlyArray<unknown>) {
    return mergeUnknowns<
      ReadonlyArray<unknown>,
      typeof utils,
      GetDeepMergeFunctionsURIs<PMF>,
      MetaData,
      MetaMetaData
    >(objects, utils, rootMetaData);
  }

  return customizedDeepmerge as CustomizedDeepmerge;
}

/**
 * The the utils that are available to the merge functions.
 *
 * @param options - The options the user specified
 */
function getUtils<
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  options: DeepMergeOptions<M, MM>,
  customizedDeepmerge: DeepMergeUtils<M, MM>["deepmerge"],
): DeepMergeUtils<M, MM> {
  return {
    defaultMergeFunctions,
    mergeFunctions: {
      ...defaultMergeFunctions,
      ...Object.fromEntries(
        Object.entries(options)
          .filter(([key, option]) => Object.hasOwn(defaultMergeFunctions, key))
          .map(([key, option]) =>
            option === false
              ? [key, defaultMergeFunctions.mergeOthers]
              : [key, option],
          ),
      ),
    } as DeepMergeUtils<M, MM>["mergeFunctions"],
    metaDataUpdater: (options.metaDataUpdater ??
      defaultMetaDataUpdater) as unknown as DeepMergeUtils<
      M,
      MM
    >["metaDataUpdater"],
    deepmerge: customizedDeepmerge,
    useImplicitDefaultMerging: options.enableImplicitDefaultMerging ?? false,
    filterValues:
      options.filterValues === false
        ? undefined
        : options.filterValues ?? defaultFilterValues,
    actions,
  };
}

/**
 * Merge unknown things.
 *
 * @param values - The values.
 */
export function mergeUnknowns<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(values: Ts, utils: U, meta: M | undefined): DeepMergeHKT<Ts, Fs, M> {
  const filteredValues = utils.filterValues?.(values, meta) ?? values;

  if (filteredValues.length === 0) {
    return undefined as DeepMergeHKT<Ts, Fs, M>;
  }
  if (filteredValues.length === 1) {
    return mergeOthers<U, M, MM>(filteredValues, utils, meta) as DeepMergeHKT<
      Ts,
      Fs,
      M
    >;
  }

  const type = getObjectType(filteredValues[0]);

  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    for (let m_index = 1; m_index < filteredValues.length; m_index++) {
      if (getObjectType(filteredValues[m_index]) === type) {
        continue;
      }

      return mergeOthers<U, M, MM>(filteredValues, utils, meta) as DeepMergeHKT<
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
      return mergeArrays<U, M, MM>(
        filteredValues as ReadonlyArray<Readonly<ReadonlyArray<unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.SET: {
      return mergeSets<U, M, MM>(
        filteredValues as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.MAP: {
      return mergeMaps<U, M, MM>(
        filteredValues as ReadonlyArray<
          Readonly<ReadonlyMap<unknown, unknown>>
        >,
        utils,
        meta,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    default: {
      return mergeOthers<U, M, MM>(filteredValues, utils, meta) as DeepMergeHKT<
        Ts,
        Fs,
        M
      >;
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
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  values: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const result = utils.mergeFunctions.mergeRecords(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeRecords !==
        utils.defaultMergeFunctions.mergeRecords)
  ) {
    return utils.defaultMergeFunctions.mergeRecords<
      ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
      U,
      Fs,
      M,
      MM
    >(values, utils, meta);
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
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  values: ReadonlyArray<Readonly<ReadonlyArray<unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const result = utils.mergeFunctions.mergeArrays(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeArrays !==
        utils.defaultMergeFunctions.mergeArrays)
  ) {
    return utils.defaultMergeFunctions.mergeArrays(values);
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
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  values: ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const result = utils.mergeFunctions.mergeSets(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeSets !== utils.defaultMergeFunctions.mergeSets)
  ) {
    return utils.defaultMergeFunctions.mergeSets(values);
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
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  values: ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const result = utils.mergeFunctions.mergeMaps(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeMaps !== utils.defaultMergeFunctions.mergeMaps)
  ) {
    return utils.defaultMergeFunctions.mergeMaps(values);
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
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(values: ReadonlyArray<unknown>, utils: U, meta: M | undefined) {
  const result = utils.mergeFunctions.mergeOthers(values, utils, meta);

  if (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions.mergeOthers !==
        utils.defaultMergeFunctions.mergeOthers)
  ) {
    return utils.defaultMergeFunctions.mergeOthers(values);
  }
  return result;
}
