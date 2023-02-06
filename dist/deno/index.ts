export { deepmerge, deepmergeCustom } from "./deepmerge.ts";
export { deepmergeInto, deepmergeIntoCustom } from "./deepmerge-into.ts";

export type { MergeFunctions as DeepMergeMergeIntoFunctionsDefaults } from "./defaults/into.ts";
export type { MergeFunctions as DeepMergeMergeFunctionsDefaults } from "./defaults/vanilla.ts";
export type {
  DeepMergeArraysDefaultHKT,
  DeepMergeBuiltInMetaData,
  DeepMergeHKT,
  DeepMergeLeaf,
  DeepMergeLeafHKT,
  DeepMergeLeafURI,
  DeepMergeMapsDefaultHKT,
  DeepMergeMergeFunctionsDefaultURIs,
  DeepMergeMergeFunctionsURIs,
  DeepMergeMergeFunctionURItoKind,
  DeepMergeMergeFunctionUtils,
  DeepMergeMergeIntoFunctionUtils,
  DeepMergeOptions,
  DeepMergeIntoOptions,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
  Reference as DeepMergeValueReference,
} from "./types/index.ts";
