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
