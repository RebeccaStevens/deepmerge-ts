import type { DeepMergeBuiltInMetaData } from "../types";

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
  return values.filter((value) => value !== undefined);
}
