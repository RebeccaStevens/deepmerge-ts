import type {
  DeepMergeBuiltInMetaData,
  DeepMergeHKT,
  DeepMergeArraysDefaultHKT,
  DeepMergeMergeFunctionsDefaultURIs,
  DeepMergeMapsDefaultHKT,
  DeepMergeMergeFunctionsURIs,
  DeepMergeOptions,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
  DeepMergeMergeFunctionUtils,
  GetDeepMergeMergeFunctionsURIs,
} from "./types";
import {
  getIterableOfIterables,
  getKeys,
  getObjectType,
  ObjectType,
  objectHasProperty,
} from "./utils";

const defaultMergeFunctions = {
  mergeMaps,
  mergeSets,
  mergeArrays,
  mergeRecords,
  mergeOthers: leaf,
} as const;

/**
 * The default function to update meta data.
 */
function defaultMetaDataUpdater<M>(
  previousMeta: M,
  metaMeta: DeepMergeBuiltInMetaData
): DeepMergeBuiltInMetaData {
  return metaMeta;
}

/**
 * The default merge functions.
 */
export type DeepMergeMergeFunctionsDefaults = typeof defaultMergeFunctions;

/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
export function deepmerge<Ts extends Readonly<ReadonlyArray<unknown>>>(
  ...objects: readonly [...Ts]
): DeepMergeHKT<
  Ts,
  DeepMergeMergeFunctionsDefaultURIs,
  DeepMergeBuiltInMetaData
> {
  return deepmergeCustom({})(...objects) as DeepMergeHKT<
    Ts,
    DeepMergeMergeFunctionsDefaultURIs,
    DeepMergeBuiltInMetaData
  >;
}

/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
export function deepmergeCustom<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>
>(
  options: DeepMergeOptions<DeepMergeBuiltInMetaData, DeepMergeBuiltInMetaData>
): <Ts extends ReadonlyArray<unknown>>(
  ...objects: Ts
) => DeepMergeHKT<
  Ts,
  GetDeepMergeMergeFunctionsURIs<PMF>,
  DeepMergeBuiltInMetaData
>;

/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items' being merged.
 */
export function deepmergeCustom<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>,
  MetaData,
  MetaMetaData extends Readonly<
    Record<PropertyKey, unknown>
  > = DeepMergeBuiltInMetaData
>(
  options: DeepMergeOptions<MetaData, MetaMetaData>,
  rootMetaData?: MetaData
): <Ts extends ReadonlyArray<unknown>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>, MetaData>;

export function deepmergeCustom<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>,
  MetaData,
  MetaMetaData extends Readonly<Record<PropertyKey, unknown>>
>(
  options: DeepMergeOptions<MetaData, MetaMetaData>,
  rootMetaData?: MetaData
): <Ts extends ReadonlyArray<unknown>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>, MetaData> {
  /**
   * The type of the customized deepmerge function.
   */
  type CustomizedDeepmerge = <Ts extends ReadonlyArray<unknown>>(
    ...objects: Ts
  ) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>, MetaData>;

  const utils: DeepMergeMergeFunctionUtils<MetaData, MetaMetaData> = getUtils(
    options,
    customizedDeepmerge as CustomizedDeepmerge
  );

  /**
   * The customized deepmerge function.
   */
  function customizedDeepmerge(...objects: ReadonlyArray<unknown>) {
    return mergeUnknowns<
      ReadonlyArray<unknown>,
      typeof utils,
      GetDeepMergeMergeFunctionsURIs<PMF>,
      MetaData,
      MetaMetaData
    >(objects, utils, rootMetaData);
  }

  return customizedDeepmerge as CustomizedDeepmerge;
}

/**
 * The the full options with defaults apply.
 *
 * @param options - The options the user specified
 */
function getUtils<M, MM extends Readonly<Record<PropertyKey, unknown>>>(
  options: DeepMergeOptions<M, MM>,
  customizedDeepmerge: DeepMergeMergeFunctionUtils<M, MM>["deepmerge"]
): DeepMergeMergeFunctionUtils<M, MM> {
  return {
    defaultMergeFunctions,
    mergeFunctions: {
      ...defaultMergeFunctions,
      ...Object.fromEntries(
        Object.entries(options)
          .filter(([key, option]) =>
            Object.prototype.hasOwnProperty.call(defaultMergeFunctions, key)
          )
          .map(([key, option]) =>
            option === false ? [key, leaf] : [key, option]
          )
      ),
    } as DeepMergeMergeFunctionUtils<M, MM>["mergeFunctions"],
    metaDataUpdater: (options.metaDataUpdater ??
      defaultMetaDataUpdater) as unknown as DeepMergeMergeFunctionUtils<
      M,
      MM
    >["metaDataUpdater"],
    deepmerge: customizedDeepmerge,
  };
}

/**
 * Merge unknown things.
 *
 * @param values - The values.
 */
function mergeUnknowns<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeMergeFunctionUtils<M, MM>,
  MF extends DeepMergeMergeFunctionsURIs,
  M,
  MM extends Readonly<Record<PropertyKey, unknown>>
>(values: Ts, utils: U, meta: M | undefined): DeepMergeHKT<Ts, MF, M> {
  if (values.length === 0) {
    return undefined as DeepMergeHKT<Ts, MF, M>;
  }
  if (values.length === 1) {
    return utils.mergeFunctions.mergeOthers(
      values,
      utils,
      meta
    ) as DeepMergeHKT<Ts, MF, M>;
  }

  const type = getObjectType(values[0]);

  // eslint-disable-next-line functional/no-conditional-statement -- add an early escape for better performance.
  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    // eslint-disable-next-line functional/no-loop-statement -- using a loop here is more performant than mapping every value and then testing every value.
    for (let mutableIndex = 1; mutableIndex < values.length; mutableIndex++) {
      if (getObjectType(values[mutableIndex]) === type) {
        continue;
      }

      return utils.mergeFunctions.mergeOthers(
        values,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;
    }
  }

  switch (type) {
    case ObjectType.RECORD:
      return utils.mergeFunctions.mergeRecords(
        values as ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;

    case ObjectType.ARRAY:
      return utils.mergeFunctions.mergeArrays(
        values as ReadonlyArray<Readonly<ReadonlyArray<unknown>>>,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;

    case ObjectType.SET:
      return utils.mergeFunctions.mergeSets(
        values as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;

    case ObjectType.MAP:
      return utils.mergeFunctions.mergeMaps(
        values as ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;

    default:
      return utils.mergeFunctions.mergeOthers(
        values,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;
  }
}

/**
 * Merge records.
 *
 * @param values - The records.
 */
function mergeRecords<
  Ts extends ReadonlyArray<Record<PropertyKey, unknown>>,
  U extends DeepMergeMergeFunctionUtils<M, MM>,
  MF extends DeepMergeMergeFunctionsURIs,
  M,
  MM extends DeepMergeBuiltInMetaData
>(values: Ts, utils: U, meta: M | undefined) {
  const result: Record<PropertyKey, unknown> = {};

  /* eslint-disable functional/no-loop-statement, functional/no-conditional-statement -- using a loop here is more performant. */

  for (const key of getKeys(values)) {
    const propValues = [];

    for (const value of values) {
      if (objectHasProperty(value, key)) {
        propValues.push(value[key]);
      }
    }

    // assert(propValues.length > 0);

    const updatedMeta = utils.metaDataUpdater(meta, {
      key,
      parents: values,
    } as unknown as MM);

    result[key] = mergeUnknowns<ReadonlyArray<unknown>, U, MF, M, MM>(
      propValues,
      utils,
      updatedMeta
    );
  }

  /* eslint-enable functional/no-loop-statement, functional/no-conditional-statement */

  return result as DeepMergeRecordsDefaultHKT<Ts, MF, M>;
}

/**
 * Merge arrays.
 *
 * @param values - The arrays.
 */
function mergeArrays<
  Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
  MF extends DeepMergeMergeFunctionsURIs,
  M
>(values: Ts) {
  return values.flat() as DeepMergeArraysDefaultHKT<Ts, MF, M>;
}

/**
 * Merge sets.
 *
 * @param values - The sets.
 */
function mergeSets<Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>>(
  values: Ts
) {
  return new Set(getIterableOfIterables(values)) as DeepMergeSetsDefaultHKT<Ts>;
}

/**
 * Merge maps.
 *
 * @param values - The maps.
 */
function mergeMaps<
  Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>
>(values: Ts) {
  return new Map(getIterableOfIterables(values)) as DeepMergeMapsDefaultHKT<Ts>;
}

/**
 * Merge "other" things.
 *
 * @param values - The values.
 */
function leaf<Ts extends ReadonlyArray<unknown>>(values: Ts) {
  return values[values.length - 1];
}
