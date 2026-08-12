import type { DeepMergeBuiltInMetaData } from "../types/index.ts";

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
