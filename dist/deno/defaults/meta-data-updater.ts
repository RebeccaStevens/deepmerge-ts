import type { DeepMergeBuiltInMetaData } from "../types/index.ts";

/**
 * The default function to update meta data.
 */
export function defaultMetaDataUpdater<M>(
  previousMeta: M,
  metaMeta: DeepMergeBuiltInMetaData
): DeepMergeBuiltInMetaData {
  return metaMeta;
}
