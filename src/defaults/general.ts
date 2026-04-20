import type { DeepMergeMetaData, DeepMergeMetaMetaData } from "../types/index.ts";

/**
 * The default function to update meta data.
 *
 * It doesn't update the meta data.
 */
export function defaultMetaDataUpdater(
  previousMeta: DeepMergeMetaData,
  metaMeta: DeepMergeMetaMetaData,
): DeepMergeMetaData {
  const ancestor = {
    key: metaMeta.key,
    parents: metaMeta.parents,
    values: metaMeta.values,
    result: metaMeta.result,
  };
  return {
    key: metaMeta.key,
    parents: metaMeta.parents,
    hierarchy: previousMeta?.hierarchy === undefined ? [ancestor] : [...previousMeta.hierarchy, ancestor],
  };
}

/**
 * The default function to filter values.
 *
 * It filters out undefined values.
 */
export function defaultFilterValues<Ts extends ReadonlyArray<unknown>, M>(values: Ts, meta: M): unknown[] {
  return values.filter((value) => value !== undefined);
}
