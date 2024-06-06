import { actionsInto as actions } from "./actions.ts";
import {
  defaultFilterValues,
  defaultMetaDataUpdater,
} from "./defaults/general.ts";
import { mergeIntoFunctions as defaultMergeIntoFunctions } from "./defaults/into.ts";
import {
  type DeepMergeBuiltInMetaData,
  type DeepMergeFunctionsDefaultURIs,
  type DeepMergeHKT,
  type DeepMergeIntoFunctionUtils,
  type DeepMergeIntoOptions,
  type Reference,
} from "./types/index.ts";
import { type SimplifyObject } from "./types/utils.ts";
import { ObjectType, getObjectType } from "./utils.ts";

/**
 * Deeply merge objects into a target.
 *
 * @param target - This object will be mutated with the merge result.
 * @param objects - The objects to merge into the target.
 */
export function deepmergeInto<T extends object>(
  target: T,
  ...objects: ReadonlyArray<T>
): void;

/**
 * Deeply merge objects into a target.
 *
 * @param target - This object will be mutated with the merge result.
 * @param objects - The objects to merge into the target.
 */
export function deepmergeInto<
  Target extends object,
  Ts extends ReadonlyArray<unknown>,
>(
  target: Target,
  ...objects: Ts
): asserts target is SimplifyObject<
  Target &
    DeepMergeHKT<
      [Target, ...Ts],
      DeepMergeFunctionsDefaultURIs,
      DeepMergeBuiltInMetaData
    >
>;

export function deepmergeInto<
  Target extends object,
  Ts extends ReadonlyArray<unknown>,
>(
  target: Target,
  ...objects: Ts
): asserts target is SimplifyObject<
  Target &
    DeepMergeHKT<
      [Target, ...Ts],
      DeepMergeFunctionsDefaultURIs,
      DeepMergeBuiltInMetaData
    >
> {
  return void deepmergeIntoCustom({})(target, ...objects);
}

/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
export function deepmergeIntoCustom<BaseTs = unknown>(
  options: DeepMergeIntoOptions<
    DeepMergeBuiltInMetaData,
    DeepMergeBuiltInMetaData
  >,
): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(
  target: Target,
  ...objects: Ts
) => void;

/**
 * Deeply merge two or more objects using the given options and meta data.
 *
 * @param options - The options on how to customize the merge function.
 * @param rootMetaData - The meta data passed to the root items' being merged.
 */
export function deepmergeIntoCustom<
  BaseTs = unknown,
  MetaData = DeepMergeBuiltInMetaData,
  MetaMetaData extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  options: DeepMergeIntoOptions<MetaData, MetaMetaData>,
  rootMetaData?: MetaData,
): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(
  target: Target,
  ...objects: Ts
) => void;

export function deepmergeIntoCustom<
  BaseTs,
  MetaData,
  MetaMetaData extends DeepMergeBuiltInMetaData,
>(
  options: DeepMergeIntoOptions<MetaData, MetaMetaData>,
  rootMetaData?: MetaData,
): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(
  target: Target,
  ...objects: Ts
) => void {
  /**
   * The type of the customized deepmerge function.
   */
  type CustomizedDeepmergeInto = <
    Target extends object,
    Ts extends ReadonlyArray<unknown>,
  >(
    target: Target,
    ...objects: Ts
  ) => void;

  const utils: DeepMergeIntoFunctionUtils<MetaData, MetaMetaData> =
    getIntoUtils(options, customizedDeepmergeInto as CustomizedDeepmergeInto);

  /**
   * The customized deepmerge function.
   */
  function customizedDeepmergeInto(
    target: object,
    ...objects: ReadonlyArray<unknown>
  ) {
    mergeUnknownsInto<
      ReadonlyArray<unknown>,
      typeof utils,
      MetaData,
      MetaMetaData
    >({ value: target }, [target, ...objects], utils, rootMetaData);
  }

  return customizedDeepmergeInto as CustomizedDeepmergeInto;
}

/**
 * The the utils that are available to the merge functions.
 *
 * @param options - The options the user specified
 */
function getIntoUtils<
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  options: DeepMergeIntoOptions<M, MM>,
  customizedDeepmergeInto: DeepMergeIntoFunctionUtils<M, MM>["deepmergeInto"],
): DeepMergeIntoFunctionUtils<M, MM> {
  return {
    defaultMergeFunctions: defaultMergeIntoFunctions,
    mergeFunctions: {
      ...defaultMergeIntoFunctions,
      ...Object.fromEntries(
        Object.entries(options)
          .filter(([key, option]) =>
            Object.hasOwn(defaultMergeIntoFunctions, key),
          )
          .map(([key, option]) =>
            option === false
              ? [key, defaultMergeIntoFunctions.mergeOthers]
              : [key, option],
          ),
      ),
    } as DeepMergeIntoFunctionUtils<M, MM>["mergeFunctions"],
    metaDataUpdater: (options.metaDataUpdater ??
      defaultMetaDataUpdater) as unknown as DeepMergeIntoFunctionUtils<
      M,
      MM
    >["metaDataUpdater"],
    deepmergeInto: customizedDeepmergeInto,
    filterValues:
      options.filterValues === false
        ? undefined
        : options.filterValues ?? defaultFilterValues,
    actions,
  };
}

/**
 * Merge unknown things into a target.
 *
 * @param m_target - The target to merge into.
 * @param values - The values.
 */
export function mergeUnknownsInto<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeIntoFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  m_target: Reference<unknown>,
  values: Ts,
  utils: U,
  meta: M | undefined,
  // eslint-disable-next-line ts/no-invalid-void-type
): void | symbol {
  const filteredValues = utils.filterValues?.(values, meta) ?? values;

  if (filteredValues.length === 0) {
    return;
  }
  if (filteredValues.length === 1) {
    return void mergeOthersInto<U, M, MM>(
      m_target,
      filteredValues,
      utils,
      meta,
    );
  }

  const type = getObjectType(m_target.value);

  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    for (let m_index = 1; m_index < filteredValues.length; m_index++) {
      if (getObjectType(filteredValues[m_index]) === type) {
        continue;
      }

      return void mergeOthersInto<U, M, MM>(
        m_target,
        filteredValues,
        utils,
        meta,
      );
    }
  }

  switch (type) {
    case ObjectType.RECORD: {
      return void mergeRecordsInto<U, M, MM>(
        m_target as Reference<Record<PropertyKey, unknown>>,
        filteredValues as ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
        utils,
        meta,
      );
    }

    case ObjectType.ARRAY: {
      return void mergeArraysInto<U, M, MM>(
        m_target as Reference<unknown[]>,
        filteredValues as ReadonlyArray<ReadonlyArray<unknown>>,
        utils,
        meta,
      );
    }

    case ObjectType.SET: {
      return void mergeSetsInto<U, M, MM>(
        m_target as Reference<Set<unknown>>,
        filteredValues as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils,
        meta,
      );
    }

    case ObjectType.MAP: {
      return void mergeMapsInto<U, M, MM>(
        m_target as Reference<Map<unknown, unknown>>,
        filteredValues as ReadonlyArray<
          Readonly<ReadonlyMap<unknown, unknown>>
        >,
        utils,
        meta,
      );
    }

    default: {
      return void mergeOthersInto<U, M, MM>(
        m_target,
        filteredValues,
        utils,
        meta,
      );
    }
  }
}

/**
 * Merge records into a target record.
 *
 * @param m_target - The target to merge into.
 * @param values - The records.
 */
function mergeRecordsInto<
  U extends DeepMergeIntoFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  m_target: Reference<Record<PropertyKey, unknown>>,
  values: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const action = utils.mergeFunctions.mergeRecords(
    m_target,
    values,
    utils,
    meta,
  );

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeRecords<
      ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
      U,
      M,
      MM
    >(m_target, values, utils, meta);
  }
}

/**
 * Merge arrays into a target array.
 *
 * @param m_target - The target to merge into.
 * @param values - The arrays.
 */
function mergeArraysInto<
  U extends DeepMergeIntoFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  m_target: Reference<unknown[]>,
  values: ReadonlyArray<ReadonlyArray<unknown>>,
  utils: U,
  meta: M | undefined,
) {
  const action = utils.mergeFunctions.mergeArrays(
    m_target,
    values,
    utils,
    meta,
  );

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeArrays(m_target, values);
  }
}

/**
 * Merge sets into a target set.
 *
 * @param m_target - The target to merge into.
 * @param values - The sets.
 */
function mergeSetsInto<
  U extends DeepMergeIntoFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  m_target: Reference<Set<unknown>>,
  values: ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const action = utils.mergeFunctions.mergeSets(m_target, values, utils, meta);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeSets(m_target, values);
  }
}

/**
 * Merge maps into a target map.
 *
 * @param m_target - The target to merge into.
 * @param values - The maps.
 */
function mergeMapsInto<
  U extends DeepMergeIntoFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  m_target: Reference<Map<unknown, unknown>>,
  values: ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
  utils: U,
  meta: M | undefined,
) {
  const action = utils.mergeFunctions.mergeMaps(m_target, values, utils, meta);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeMaps(m_target, values);
  }
}

/**
 * Merge other things into a target.
 *
 * @param m_target - The target to merge into.
 * @param values - The other things.
 */
function mergeOthersInto<
  U extends DeepMergeIntoFunctionUtils<M, MM>,
  M,
  MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData,
>(
  m_target: Reference<unknown>,
  values: ReadonlyArray<unknown>,
  utils: U,
  meta: M | undefined,
) {
  const action = utils.mergeFunctions.mergeOthers(
    m_target,
    values,
    utils,
    meta,
  );

  if (
    action === actions.defaultMerge ||
    m_target.value === actions.defaultMerge
  ) {
    utils.defaultMergeFunctions.mergeOthers(m_target, values);
  }
}
