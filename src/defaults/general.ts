import { actions } from "../actions.ts";
import type {
  DeepMergeArraysDefaultHKT,
  DeepMergeBuiltInMetaData,
  DeepMergeFunctionsURIs,
  DeepMergeMetaData,
  DeepMergeMetaMetaData,
  DeepMergeSetsDefaultHKT,
  DeepMergeUtils,
  DeepMergeValueReference,
  HierarchyValue,
} from "../types/index.ts";

/**
 * The default function to update meta data.
 *
 * It builds and updates the hierarchy tree.
 *
 * @param previousMeta - The previous meta data.
 * @param metaMeta - Meta information about the current merge state.
 */
export function defaultMetaDataUpdater(
  previousMeta: DeepMergeBuiltInMetaData | undefined,
  metaMeta: DeepMergeMetaMetaData,
): DeepMergeBuiltInMetaData {
  const ancestor: HierarchyValue = {
    key: metaMeta.key,
    parents: metaMeta.parents,
    values: metaMeta.values,
    result: metaMeta.result,
  };
  const prevHierarchy = previousMeta?.hierarchy;
  return {
    ...ancestor,
    hierarchy: prevHierarchy === undefined ? [ancestor] : [...prevHierarchy, ancestor],
  };
}

/**
 * The default function to update meta data in fast mode.
 *
 * It doesn't track any meta data.
 *
 * @param previousMeta - The previous meta data.
 * @param metaMeta - Meta information about the current merge state.
 */
export function defaultMetaDataUpdaterFast(previousMeta: undefined, metaMeta: DeepMergeMetaMetaData): undefined {
  return undefined;
}

/**
 * The default function to filter values.
 *
 * It filters out undefined values.
 *
 * @param values - The values to filter.
 * @param meta - The meta data.
 */
export function defaultFilterValues<Ts extends ReadonlyArray<unknown>, M>(
  values: Ts,
  meta: M | undefined,
): ReadonlyArray<unknown> {
  // Fast path: avoid allocating a new array when no undefined values exist.
  return values.includes(undefined) ? values.filter((value) => value !== undefined) : values;
}

/**
 * Check if the custom merge result should fall back to the default merge function.
 *
 * @param utils - The utils.
 * @param fallback - The name of the fallback merge function.
 * @param result - The result of the custom merge function.
 * @returns Whether to use the default merge function.
 */
export function hasFallback<M extends DeepMergeMetaData, MM extends DeepMergeMetaMetaData>(
  utils: DeepMergeUtils<M, MM>,
  fallback: keyof DeepMergeUtils<M, MM>["mergeFunctions"],
  result: unknown,
): boolean {
  return (
    result === actions.defaultMerge ||
    (utils.useImplicitDefaultMerging &&
      result === undefined &&
      utils.mergeFunctions[fallback] !== utils.defaultMergeFunctions[fallback])
  );
}

/**
 * Resolve custom merge functions from user options.
 *
 * @param options - The options passed by the user.
 * @param defaultMergeFunctions - The default merge functions.
 * @returns The resolved merge functions.
 */
export function resolveCustomMergeFunctions<Fns extends { mergeOthers: unknown } & Record<PropertyKey, unknown>>(
  options: Record<PropertyKey, unknown>,
  defaultMergeFunctions: Fns,
): Fns {
  return {
    ...defaultMergeFunctions,
    ...Object.fromEntries(
      Object.entries(options)
        .filter(([key]) => Object.hasOwn(defaultMergeFunctions, key))
        .map(([key, option]) =>
          option === false
            ? [key, defaultMergeFunctions.mergeOthers]
            : typeof option === "function"
              ? [key, option]
              : [key, defaultMergeFunctions[key]],
        ),
    ),
  };
}

/**
 * The default strategy to merge arrays.
 *
 * @param values - The arrays.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
export function mergeArrays<
  Ts extends ReadonlyArray<ReadonlyArray<unknown>>,
  U extends DeepMergeUtils<M, MM>,
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils?: U, meta?: M): DeepMergeArraysDefaultHKT<Ts, Fs, M> {
  return values.flat() as DeepMergeArraysDefaultHKT<Ts, Fs, M>;
}

/**
 * The default strategy to merge sets.
 *
 * @param values - The sets.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
export function mergeSets<
  Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>,
  U extends DeepMergeUtils<M, MM>,
  // eslint-disable-next-line ts/no-unused-vars
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils?: U, meta?: M): DeepMergeSetsDefaultHKT<Ts> {
  const result = new Set<unknown>();
  for (const set of values) {
    for (const element of set) {
      result.add(element);
    }
  }
  return result as DeepMergeSetsDefaultHKT<Ts>;
}

/**
 * The default strategy to merge other things.
 *
 * @param values - The other things.
 * @param utils - The utils.
 * @param meta - The meta data.
 */
export function mergeOthers<
  Ts extends ReadonlyArray<unknown>,
  U extends DeepMergeUtils<M, MM>,
  // eslint-disable-next-line ts/no-unused-vars
  Fs extends DeepMergeFunctionsURIs,
  M extends DeepMergeMetaData,
  MM extends DeepMergeMetaMetaData = DeepMergeMetaMetaData,
>(values: Ts, utils?: U, meta?: M): unknown {
  return values.at(-1);
}

/**
 * The default strategy to merge arrays into a target array.
 *
 * @param mut_target - The target to merge into.
 * @param values - The arrays (including the target's value if there is one).
 */
export function mergeArraysInto<Ts extends ReadonlyArray<ReadonlyArray<unknown>>>(
  mut_target: DeepMergeValueReference<unknown[]>,
  values: Ts,
): void {
  for (let mut_i = 1; mut_i < values.length; mut_i++) {
    const arr = values[mut_i]!;
    for (const element of arr) {
      mut_target.value.push(element);
    }
  }
}

/**
 * The default strategy to merge sets into a target set.
 *
 * @param mut_target - The target to merge into.
 * @param values - The sets (including the target's value if there is one).
 */
export function mergeSetsInto<Ts extends ReadonlyArray<Readonly<ReadonlySet<unknown>>>>(
  mut_target: DeepMergeValueReference<Set<unknown>>,
  values: Ts,
): void {
  for (let mut_i = 1; mut_i < values.length; mut_i++) {
    for (const value of values[mut_i]!) {
      mut_target.value.add(value);
    }
  }
}

/**
 * The default strategy to merge other things into a target.
 *
 * @param mut_target - The target to merge into.
 * @param values - The other things.
 */
export function mergeOthersInto<Ts extends ReadonlyArray<unknown>>(
  mut_target: DeepMergeValueReference<unknown>,
  values: Ts,
): void {
  mut_target.value = values.at(-1);
}
