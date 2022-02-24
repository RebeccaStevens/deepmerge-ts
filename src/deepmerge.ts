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
  mergeMaps: defaultMergeMaps,
  mergeSets: defaultMergeSets,
  mergeArrays: defaultMergeArrays,
  mergeRecords: defaultMergeRecords,
  mergeOthers: leaf,
} as const;

/**
 * Special values that tell deepmerge-ts to perform a certain action.
 */
const actions = {
  defaultMerge: Symbol("deepmerge-ts: default merge"),
  skip: Symbol("deepmerge-ts: skip"),
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
  MetaMetaData extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData
>(
  options: DeepMergeOptions<MetaData, MetaMetaData>,
  rootMetaData?: MetaData
): <Ts extends ReadonlyArray<unknown>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, GetDeepMergeMergeFunctionsURIs<PMF>, MetaData>;

export function deepmergeCustom<
  PMF extends Partial<DeepMergeMergeFunctionsURIs>,
  MetaData,
  MetaMetaData extends DeepMergeBuiltInMetaData
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
function getUtils<M, MM extends DeepMergeBuiltInMetaData>(
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
    useImplicitDefaultMerging: options.enableImplicitDefaultMerging ?? false,
    actions,
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
  MM extends DeepMergeBuiltInMetaData
>(values: Ts, utils: U, meta: M | undefined): DeepMergeHKT<Ts, MF, M> {
  if (values.length === 0) {
    return undefined as DeepMergeHKT<Ts, MF, M>;
  }
  if (values.length === 1) {
    return mergeOthers<U, M, MM>(values, utils, meta) as DeepMergeHKT<
      Ts,
      MF,
      M
    >;
  }

  const type = getObjectType(values[0]);

  // eslint-disable-next-line functional/no-conditional-statement -- add an early escape for better performance.
  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    // eslint-disable-next-line functional/no-loop-statement -- using a loop here is more performant than mapping every value and then testing every value.
    for (let mutableIndex = 1; mutableIndex < values.length; mutableIndex++) {
      if (getObjectType(values[mutableIndex]) === type) {
        continue;
      }

      return mergeOthers<U, M, MM>(values, utils, meta) as DeepMergeHKT<
        Ts,
        MF,
        M
      >;
    }
  }

  switch (type) {
    case ObjectType.RECORD:
      return mergeRecords<U, MF, M, MM>(
        values as ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;

    case ObjectType.ARRAY:
      return mergeArrays<U, M, MM>(
        values as ReadonlyArray<Readonly<ReadonlyArray<unknown>>>,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;

    case ObjectType.SET:
      return mergeSets<U, M, MM>(
        values as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;

    case ObjectType.MAP:
      return mergeMaps<U, M, MM>(
        values as ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
        utils,
        meta
      ) as DeepMergeHKT<Ts, MF, M>;

    default:
      return mergeOthers<U, M, MM>(values, utils, meta) as DeepMergeHKT<
        Ts,
        MF,
        M
      >;
  }
}

/**
 * Merge records.
 *
 * @param values - The records.
 */
function mergeRecords<
  U extends DeepMergeMergeFunctionUtils<M, MM>,
  MF extends DeepMergeMergeFunctionsURIs,
  M,
  MM extends DeepMergeBuiltInMetaData
>(
  values: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
  utils: U,
  meta: M | undefined
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
      MF,
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
  U extends DeepMergeMergeFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData
>(
  values: ReadonlyArray<Readonly<ReadonlyArray<unknown>>>,
  utils: U,
  meta: M | undefined
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
  U extends DeepMergeMergeFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData
>(
  values: ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
  utils: U,
  meta: M | undefined
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
  U extends DeepMergeMergeFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData
>(
  values: ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
  utils: U,
  meta: M | undefined
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
  U extends DeepMergeMergeFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData
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

/**
 * The default strategy to merge records.
 *
 * @param values - The records.
 */
function defaultMergeRecords<
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

    const propertyResult = mergeUnknowns<ReadonlyArray<unknown>, U, MF, M, MM>(
      propValues,
      utils,
      updatedMeta
    );

    if (propertyResult === actions.skip) {
      continue;
    }

    result[key] = propertyResult;
  }

  /* eslint-enable functional/no-loop-statement, functional/no-conditional-statement */

  return result as DeepMergeRecordsDefaultHKT<Ts, MF, M>;
}

/**
 * The default strategy to merge arrays.
 *
 * @param values - The arrays.
 */
function defaultMergeArrays<
  Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
  MF extends DeepMergeMergeFunctionsURIs,
  M
>(values: Ts) {
  return values.flat() as DeepMergeArraysDefaultHKT<Ts, MF, M>;
}

/**
 * The default strategy to merge sets.
 *
 * @param values - The sets.
 */
function defaultMergeSets<
  Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>
>(values: Ts) {
  return new Set(getIterableOfIterables(values)) as DeepMergeSetsDefaultHKT<Ts>;
}

/**
 * The default strategy to merge maps.
 *
 * @param values - The maps.
 */
function defaultMergeMaps<
  Ts extends ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>
>(values: Ts) {
  return new Map(getIterableOfIterables(values)) as DeepMergeMapsDefaultHKT<Ts>;
}

/**
 * Get the last value in the given array.
 */
function leaf<Ts extends ReadonlyArray<unknown>>(values: Ts) {
  return values[values.length - 1];
}
