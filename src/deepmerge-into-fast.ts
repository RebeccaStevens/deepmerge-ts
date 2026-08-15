import { actionsInto as actions } from "./actions.ts";
import { defaultFilterValues, defaultMetaDataUpdaterFast, resolveCustomMergeFunctions } from "./defaults/general.ts";
import { mergeIntoFunctionsFast as defaultMergeIntoFunctionsFast } from "./defaults/into-fast.ts";
import type {
  DeepMergeFunctionsDefaultURIs,
  DeepMergeHKT,
  DeepMergeIntoFastUnsafeOptions,
  DeepMergeIntoFastUnsafeUtils,
  DeepMergeIntoUtils,
  DeepMergeMergeInfo,
  DeepMergeMetaData,
  DeepMergeValueReference,
  MetaDataUpdater,
} from "./types/index.ts";
import type { SimplifyObject } from "./types/utils.ts";
import { ObjectType, getObjectType } from "./utils.ts";

const defaultDeepmergeIntoFastUnsafe = /** @__PURE__ */ deepmergeIntoFastUnsafeCustom();

/**
 * Deeply merge objects into a target using a high-performance strategy.
 *
 * Differences from `deepmergeInto` (standard version):
 * - **No circular reference detection:** Does not track object hierarchies or detect cyclic references. Circular structures will result in a stack overflow.
 * - **No recursion depth limits:** Does not enforce a `maxDepth` limit (standard version defaults to 1000).
 * - **No metadata tracking:** Metadata updates and custom metadata tracking are bypassed, avoiding metadata object allocations.
 * - **No prototype pollution interception:** Assumes trusted data and directly assigns properties.
 *
 * @warning Only use this function with **trusted, non-circular data**.
 * Using this function with untrusted user data can result in serious security vulnerabilities:
 * - **Prototype pollution:** Prototype pollution safeguards are omitted for speed; malicious keys like `__proto__` can pollute object prototypes.
 * - **Denial of Service (DoS):** Circular reference detection and recursion depth limits are disabled; cyclic or deeply nested input will cause infinite recursion and crash via stack overflow.
 * @param target - This object will be mutated with the merge result.
 * @param objects - The objects to merge into the target.
 */
export function deepmergeIntoFastUnsafe<T extends object>(target: T, ...objects: ReadonlyArray<T>): void;

/**
 * Deeply merge objects into a target using a high-performance strategy.
 *
 * Differences from `deepmergeInto` (standard version):
 * - **No circular reference detection:** Does not track object hierarchies or detect cyclic references. Circular structures will result in a stack overflow.
 * - **No recursion depth limits:** Does not enforce a `maxDepth` limit (standard version defaults to 1000).
 * - **No metadata tracking:** Metadata updates and custom metadata tracking are bypassed, avoiding metadata object allocations.
 * - **No prototype pollution interception:** Assumes trusted data and directly assigns properties.
 *
 * @warning Only use this function with **trusted, non-circular data**.
 * Using this function with untrusted user data can result in serious security vulnerabilities:
 * - **Prototype pollution:** Prototype pollution safeguards are omitted for speed; malicious keys like `__proto__` can pollute object prototypes.
 * - **Denial of Service (DoS):** Circular reference detection and recursion depth limits are disabled; cyclic or deeply nested input will cause infinite recursion and crash via stack overflow.
 * @param target - This object will be mutated with the merge result.
 * @param objects - The objects to merge into the target.
 */
export function deepmergeIntoFastUnsafe<Target extends object, Ts extends ReadonlyArray<unknown>>(
  target: Target,
  ...objects: Ts
): asserts target is SimplifyObject<Target & DeepMergeHKT<[Target, ...Ts], DeepMergeFunctionsDefaultURIs, undefined>>;

export function deepmergeIntoFastUnsafe<Target extends object, Ts extends ReadonlyArray<unknown>>(
  target: Target,
  ...objects: Ts
): asserts target is SimplifyObject<Target & DeepMergeHKT<[Target, ...Ts], DeepMergeFunctionsDefaultURIs, undefined>> {
  return void defaultDeepmergeIntoFastUnsafe(target, ...objects);
}

/**
 * Used by the default `deepmergeIntoFastUnsafe` function.
 *
 * @internal
 */
export function deepmergeIntoFastUnsafeCustom(): <Target extends object, Ts extends ReadonlyArray<unknown>>(
  target: Target,
  ...objects: Ts
) => void;

/**
 * Deeply merge two or more objects into a target using the given options and a high-performance strategy.
 *
 * Differences from `deepmergeIntoCustom` (standard version):
 * - **No circular reference detection:** Does not track object hierarchies or detect cyclic references. Circular structures will result in a stack overflow.
 * - **No recursion depth limits:** Does not enforce a `maxDepth` limit (standard version defaults to 1000).
 * - **No metadata tracking:** Metadata updates and custom metadata tracking are bypassed, avoiding metadata object allocations.
 * - **No prototype pollution interception:** Assumes trusted data and directly assigns properties.
 *
 * @warning Only use this function with **trusted, non-circular data**.
 * Using this function with untrusted user data can result in serious security vulnerabilities:
 * - **Prototype pollution:** Prototype pollution safeguards are omitted for speed; malicious keys like `__proto__` can pollute object prototypes.
 * - **Denial of Service (DoS):** Circular reference detection and recursion depth limits are disabled; cyclic or deeply nested input will cause infinite recursion and crash via stack overflow.
 * @param options - The options on how to customize the merge function.
 */
export function deepmergeIntoFastUnsafeCustom<BaseTs = unknown>(
  options: DeepMergeIntoFastUnsafeOptions,
): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(target: Target, ...objects: Ts) => void;

export function deepmergeIntoFastUnsafeCustom<BaseTs = unknown>(
  options: DeepMergeIntoFastUnsafeOptions = {},
): <Target extends object, Ts extends ReadonlyArray<BaseTs>>(target: Target, ...objects: Ts) => void {
  const utils: DeepMergeIntoFastUnsafeUtils = getUtilsFast(options, customizedDeepmergeIntoFast);

  function customizedDeepmergeIntoFast<Target extends object, Ts extends ReadonlyArray<unknown>>(
    target: Target,
    ...objects: Ts
  ): void {
    mergeUnknownsIntoFast<ReadonlyArray<unknown>, typeof utils, undefined>(
      { value: target },
      [target, ...objects],
      utils,
    );
  }

  return customizedDeepmergeIntoFast;
}

/**
 * Get the utils that are available to the merge functions in fast mode.
 *
 * @param options - The options the user specified.
 * @param customizedDeepmergeIntoFast - The customized deepmergeIntoFastUnsafe function.
 */
function getUtilsFast(
  options: DeepMergeIntoFastUnsafeOptions,
  customizedDeepmergeIntoFast: DeepMergeIntoFastUnsafeUtils["deepmergeInto"],
): DeepMergeIntoFastUnsafeUtils {
  const defaultMergeFns =
    defaultMergeIntoFunctionsFast as unknown as DeepMergeIntoFastUnsafeUtils["defaultMergeFunctions"];
  const defaultMetaDataUpd = defaultMetaDataUpdaterFast as MetaDataUpdater<undefined>;

  return {
    defaultMergeFunctions: defaultMergeFns,
    mergeFunctions: resolveCustomMergeFunctions(options, defaultMergeFns),
    metaDataUpdater: defaultMetaDataUpd,
    deepmergeInto: customizedDeepmergeIntoFast,
    filterValues:
      options.filterValues === false
        ? undefined
        : typeof options.filterValues === "function"
          ? options.filterValues
          : defaultFilterValues,
    maxDepth: undefined,
    actions,
  };
}

/**
 * Merge unknown things into a target in fast mode without checking for circular references or depth limits.
 *
 * @param mut_target - The target to merge into.
 * @param values - The values.
 * @param utils - The utils.
 */
export function mergeUnknownsIntoFast<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(
  mut_target: DeepMergeValueReference<unknown>,
  values: Ts,
  utils: U,
  // eslint-disable-next-line ts/no-invalid-void-type
): void | symbol {
  const filteredValues = utils.filterValues?.(values, undefined) ?? values;

  if (filteredValues.length === 0) {
    return;
  }
  if (filteredValues.length === 1) {
    return void mergeOthersIntoFast<U, M, MI>(mut_target, filteredValues, utils);
  }

  const type = getObjectType(mut_target.value);

  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    if (filteredValues.length === 2) {
      // Fast path: avoid loop overhead for 2 elements.
      if (getObjectType(filteredValues[1]) !== type) {
        return void mergeOthersIntoFast<U, M, MI>(mut_target, filteredValues, utils);
      }
    } else {
      // Slow path: 3 or more elements require full iteration.
      for (let mut_index = 1; mut_index < filteredValues.length; mut_index++) {
        if (getObjectType(filteredValues[mut_index]) !== type) {
          return void mergeOthersIntoFast<U, M, MI>(mut_target, filteredValues, utils);
        }
      }
    }
  }

  switch (type) {
    case ObjectType.RECORD: {
      return void mergeRecordsIntoFast<U, M, MI>(
        mut_target as DeepMergeValueReference<Record<PropertyKey, unknown>>,
        filteredValues as ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
        utils,
      );
    }

    case ObjectType.ARRAY: {
      return void mergeArraysIntoFast<U, M, MI>(
        mut_target as DeepMergeValueReference<unknown[]>,
        filteredValues as ReadonlyArray<ReadonlyArray<unknown>>,
        utils,
      );
    }

    case ObjectType.SET: {
      return void mergeSetsIntoFast<U, M, MI>(
        mut_target as DeepMergeValueReference<Set<unknown>>,
        filteredValues as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils,
      );
    }

    case ObjectType.MAP: {
      return void mergeMapsIntoFast<U, M, MI>(
        mut_target as DeepMergeValueReference<Map<unknown, unknown>>,
        filteredValues as ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
        utils,
      );
    }

    default: {
      return void mergeOthersIntoFast<U, M, MI>(mut_target, filteredValues, utils);
    }
  }
}

/**
 * Merge records into a target record in fast mode.
 *
 * @param mut_target - The target to merge into.
 * @param values - The records.
 * @param utils - The utils.
 */
function mergeRecordsIntoFast<
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(
  mut_target: DeepMergeValueReference<Record<PropertyKey, unknown>>,
  values: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
  utils: U,
) {
  const action = utils.mergeFunctions.mergeRecords(mut_target, values, utils, undefined);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeRecords(mut_target, values, utils, undefined);
  }
}

/**
 * Merge arrays into a target array in fast mode.
 *
 * @param mut_target - The target to merge into.
 * @param values - The arrays.
 * @param utils - The utils.
 */
function mergeArraysIntoFast<
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<unknown[]>, values: ReadonlyArray<ReadonlyArray<unknown>>, utils: U) {
  const action = utils.mergeFunctions.mergeArrays(mut_target, values, utils, undefined);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeArrays(mut_target, values);
  }
}

/**
 * Merge sets into a target set in fast mode.
 *
 * @param mut_target - The target to merge into.
 * @param values - The sets.
 * @param utils - The utils.
 */
function mergeSetsIntoFast<
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<Set<unknown>>, values: ReadonlyArray<Readonly<ReadonlySet<unknown>>>, utils: U) {
  const action = utils.mergeFunctions.mergeSets(mut_target, values, utils, undefined);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeSets(mut_target, values);
  }
}

/**
 * Merge maps into a target map in fast mode.
 *
 * @param mut_target - The target to merge into.
 * @param values - The maps.
 * @param utils - The utils.
 */
function mergeMapsIntoFast<
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(
  mut_target: DeepMergeValueReference<Map<unknown, unknown>>,
  values: ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
  utils: U,
) {
  const action = utils.mergeFunctions.mergeMaps(mut_target, values, utils, undefined);

  if (action === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeMaps(mut_target, values, utils, undefined);
  }
}

/**
 * Merge other things into a target in fast mode.
 *
 * @param mut_target - The target to merge into.
 * @param values - The other things.
 * @param utils - The utils.
 */
function mergeOthersIntoFast<
  U extends DeepMergeIntoUtils<M, MI>,
  M extends DeepMergeMetaData,
  MI extends DeepMergeMergeInfo = DeepMergeMergeInfo,
>(mut_target: DeepMergeValueReference<unknown>, values: ReadonlyArray<unknown>, utils: U) {
  const action = utils.mergeFunctions.mergeOthers(mut_target, values, utils, undefined);

  if (action === actions.defaultMerge || mut_target.value === actions.defaultMerge) {
    utils.defaultMergeFunctions.mergeOthers(mut_target, values);
  }
}
