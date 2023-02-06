export { deepmerge, deepmergeCustom } from "./deepmerge.js";
export { deepmergeInto, deepmergeIntoCustom } from "./deepmerge-into.js";

export type { MergeFunctions as DeepMergeMergeIntoFunctionsDefaults } from "./defaults/into.js";
export type { MergeFunctions as DeepMergeMergeFunctionsDefaults } from "./defaults/vanilla.js";
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
} from "./types/index.js";
