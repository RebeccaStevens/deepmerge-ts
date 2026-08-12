import { actions } from "../actions.ts";
import type { DeepMergeBuiltInMetaData, DeepMergeUtils } from "../types/index.ts";

/**
 * The default function to update meta data.
 *
 * It doesn't update the meta data.
 */
export function defaultMetaDataUpdater<M>(
  previousMeta: M,
  metaMeta: DeepMergeBuiltInMetaData,
): DeepMergeBuiltInMetaData {
  return metaMeta;
}

/**
 * The default function to filter values.
 *
 * It filters out undefined values.
 */
export function defaultFilterValues<Ts extends ReadonlyArray<unknown>, M>(values: Ts, meta: M | undefined): unknown[] {
  // Fast path: avoid allocating a new array when no undefined values exist.
  return values.includes(undefined) ? values.filter((value) => value !== undefined) : (values as unknown as unknown[]);
}

/**
 * Check if the custom merge result should fall back to the default merge function.
 *
 * @param utils - The utils.
 * @param fallback - The name of the fallback merge function.
 * @param result - The result of the custom merge function.
 * @returns Whether to use the default merge function.
 */
export function hasFallback<M, MM extends DeepMergeBuiltInMetaData = DeepMergeBuiltInMetaData>(
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
 * The default function to update meta data in fast mode.
 *
 * It doesn't track any meta data.
 *
 * @param previousMeta - The previous meta data.
 * @param metaMeta - Meta information about the current merge state.
 */
export function defaultMetaDataUpdaterFast(previousMeta: undefined, metaMeta: unknown): undefined {
  return undefined;
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
