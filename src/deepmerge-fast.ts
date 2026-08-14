import { actions } from "./actions.ts";
import {
  defaultFilterValues,
  defaultMetaDataUpdaterFast,
  hasFallback,
  resolveCustomMergeFunctions,
} from "./defaults/general.ts";
import { mergeFunctionsFast as defaultMergeFunctionsFast } from "./defaults/vanilla-fast.ts";
import type {
  DeepMergeFastUnsafeOptions,
  DeepMergeFastUnsafeUtils,
  DeepMergeFunctionsDefaultURIs,
  DeepMergeFunctionsURIs,
  DeepMergeHKT,
  DeepMergeMetaData,
  DeepMergeMetaMetaData,
  DeepMergeUtils,
  GetDeepMergeFunctionsURIs,
} from "./types/index.ts";
import { ObjectType, getObjectType } from "./utils.ts";

const defaultDeepmergeFastUnsafe = /** @__PURE__ */ deepmergeFastUnsafeCustom();

/**
 * Deeply merge objects using a high-performance strategy.
 *
 * Differences from `deepmerge` (standard version):
 * - **No circular reference detection:** Does not track object hierarchies or detect cyclic references. Circular structures will result in a stack overflow.
 * - **No recursion depth limits:** Does not enforce a `maxDepth` limit (standard version defaults to 1000).
 * - **No metadata tracking:** Metadata updates and custom metadata tracking are bypassed, avoiding metadata object allocations.
 * - **No prototype pollution interception:** Assumes trusted data and directly assigns properties.
 *
 * @warning Only use this function with **trusted, non-circular data**.
 * Using this function with untrusted user data can result in serious security vulnerabilities:
 * - **Prototype pollution:** Prototype pollution safeguards are omitted for speed; malicious keys like `__proto__` can pollute object prototypes.
 * - **Denial of Service (DoS):** Circular reference detection and recursion depth limits are disabled; cyclic or deeply nested input will cause infinite recursion and crash via stack overflow.
 * @param objects - The objects to merge.
 */
export function deepmergeFastUnsafe<Ts extends Readonly<ReadonlyArray<unknown>>>(
  ...objects: readonly [...Ts]
): DeepMergeHKT<Ts, DeepMergeFunctionsDefaultURIs, undefined> {
  return defaultDeepmergeFastUnsafe(...objects);
}

/**
 * Deeply merge two or more objects using the given options and a high-performance strategy.
 *
 * Differences from `deepmergeCustom` (standard version):
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
export function deepmergeFastUnsafeCustom<BaseTs = unknown, PMF extends Partial<DeepMergeFunctionsURIs> = {}>(
  options: DeepMergeFastUnsafeOptions,
): <Ts extends ReadonlyArray<BaseTs>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, undefined>;

/**
 * Used by the default `deepmergeFastUnsafe` function.
 *
 * @internal
 */
export function deepmergeFastUnsafeCustom(): <Ts extends ReadonlyArray<unknown>>(
  ...objects: Ts
) => DeepMergeHKT<Ts, DeepMergeFunctionsDefaultURIs, undefined>;

export function deepmergeFastUnsafeCustom<BaseTs = unknown, PMF extends Partial<DeepMergeFunctionsURIs> = {}>(
  options: DeepMergeFastUnsafeOptions = {},
): <Ts extends ReadonlyArray<BaseTs>>(...objects: Ts) => DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, undefined> {
  const utils: DeepMergeFastUnsafeUtils = getUtilsFast(options, customizedDeepmergeFast);

  function customizedDeepmergeFast<Ts extends ReadonlyArray<unknown>>(
    ...objects: Ts
  ): DeepMergeHKT<Ts, GetDeepMergeFunctionsURIs<PMF>, undefined> {
    return mergeUnknownsFast<Ts, typeof utils, GetDeepMergeFunctionsURIs<PMF>, undefined>(objects, utils);
  }

  return customizedDeepmergeFast;
}

/**
 * Get the utils that are available to the merge functions in fast mode.
 *
 * @param options - The options the user specified.
 * @param customizedDeepmergeFast - The customized deepmergeFastUnsafe function.
 */
function getUtilsFast(
  options: DeepMergeFastUnsafeOptions,
  customizedDeepmergeFast: DeepMergeFastUnsafeUtils["deepmerge"],
): DeepMergeFastUnsafeUtils {
  const defaultMergeFns = defaultMergeFunctionsFast as unknown as DeepMergeFastUnsafeUtils["defaultMergeFunctions"];
  const defaultMetaDataUpd = defaultMetaDataUpdaterFast as unknown as DeepMergeFastUnsafeUtils["metaDataUpdater"];

  return {
    defaultMergeFunctions: defaultMergeFns,
    mergeFunctions: resolveCustomMergeFunctions(options, defaultMergeFns),
    metaDataUpdater: defaultMetaDataUpd,
    deepmerge: customizedDeepmergeFast,
    useImplicitDefaultMerging: options.enableImplicitDefaultMerging ?? false,
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
 * Merge unknown things in fast mode without checking for circular references or depth limits.
 *
 * @param values - The values.
 * @param utils - The utils.
 */
export function mergeUnknownsFast<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils: U): DeepMergeHKT<Ts, Fs, M> {
  const filteredValues = utils.filterValues?.(values, undefined) ?? values;

  if (filteredValues.length === 0) {
    return undefined as DeepMergeHKT<Ts, Fs, M>;
  }
  if (filteredValues.length === 1) {
    return mergeOthersFast<U, M, MM>(filteredValues, utils) as DeepMergeHKT<Ts, Fs, M>;
  }

  const type = getObjectType(filteredValues[0]);

  if (type !== ObjectType.NOT && type !== ObjectType.OTHER) {
    if (filteredValues.length === 2) {
      // Fast path: avoid loop overhead for 2 elements.
      if (getObjectType(filteredValues[1]) !== type) {
        return mergeOthersFast<U, M, MM>(filteredValues, utils) as DeepMergeHKT<Ts, Fs, M>;
      }
    } else {
      // Slow path: 3 or more elements require full iteration.
      for (let mut_index = 1; mut_index < filteredValues.length; mut_index++) {
        if (getObjectType(filteredValues[mut_index]) !== type) {
          return mergeOthersFast<U, M, MM>(filteredValues, utils) as DeepMergeHKT<Ts, Fs, M>;
        }
      }
    }
  }

  switch (type) {
    case ObjectType.RECORD: {
      return mergeRecordsFast<U, M, MM>(
        filteredValues as ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>,
        utils,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.ARRAY: {
      return mergeArraysFast<U, M, MM>(
        filteredValues as ReadonlyArray<Readonly<ReadonlyArray<unknown>>>,
        utils,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.SET: {
      return mergeSetsFast<U, M, MM>(
        filteredValues as ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
        utils,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    case ObjectType.MAP: {
      return mergeMapsFast<U, M, MM>(
        filteredValues as ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>,
        utils,
      ) as DeepMergeHKT<Ts, Fs, M>;
    }

    default: {
      return mergeOthersFast<U, M, MM>(filteredValues, utils) as DeepMergeHKT<Ts, Fs, M>;
    }
  }
}

/**
 * Merge records in fast mode.
 *
 * @param values - The records.
 * @param utils - The utils.
 */
function mergeRecordsFast<
  U extends DeepMergeUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>, utils: U) {
  const result = utils.mergeFunctions.mergeRecords(values, utils, undefined);
  if (hasFallback(utils, "mergeRecords", result)) {
    return utils.defaultMergeFunctions.mergeRecords(values, utils, undefined!);
  }
  return result;
}

/**
 * Merge arrays in fast mode.
 *
 * @param values - The arrays.
 * @param utils - The utils.
 */
function mergeArraysFast<
  U extends DeepMergeUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<Readonly<ReadonlyArray<unknown>>>, utils: U) {
  const result = utils.mergeFunctions.mergeArrays(values, utils, undefined);
  if (hasFallback(utils, "mergeArrays", result)) {
    return utils.defaultMergeFunctions.mergeArrays(values);
  }
  return result;
}

/**
 * Merge sets in fast mode.
 *
 * @param values - The sets.
 * @param utils - The utils.
 */
function mergeSetsFast<
  U extends DeepMergeUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<Readonly<ReadonlySet<unknown>>>, utils: U) {
  const result = utils.mergeFunctions.mergeSets(values, utils, undefined);
  if (hasFallback(utils, "mergeSets", result)) {
    return utils.defaultMergeFunctions.mergeSets(values);
  }
  return result;
}

/**
 * Merge maps in fast mode.
 *
 * @param values - The maps.
 * @param utils - The utils.
 */
function mergeMapsFast<
  U extends DeepMergeUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<Readonly<ReadonlyMap<unknown, unknown>>>, utils: U) {
  const result = utils.mergeFunctions.mergeMaps(values, utils, undefined);
  if (hasFallback(utils, "mergeMaps", result)) {
    return utils.defaultMergeFunctions.mergeMaps(values, utils, undefined!);
  }
  return result;
}

/**
 * Merge other things in fast mode.
 *
 * @param values - The other things.
 * @param utils - The utils.
 */
function mergeOthersFast<
  U extends DeepMergeUtils<M, MM>,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: ReadonlyArray<unknown>, utils: U) {
  const result = utils.mergeFunctions.mergeOthers(values, utils, undefined);
  if (hasFallback(utils, "mergeOthers", result)) {
    return utils.defaultMergeFunctions.mergeOthers(values);
  }
  return result;
}
