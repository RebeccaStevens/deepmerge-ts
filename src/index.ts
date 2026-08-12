export { deepmerge, deepmergeCustom, deepmergeFastUnsafe, deepmergeFastUnsafeCustom } from "./deepmerge.ts";
export {
  deepmergeInto,
  deepmergeIntoCustom,
  deepmergeIntoFastUnsafe,
  deepmergeIntoFastUnsafeCustom,
} from "./deepmerge-into.ts";
export { type ObjectType, getKeys, getObjectType, objectHasProperty } from "./utils.ts";

export type { MergeFunctions as DeepMergeIntoFunctionsDefaults } from "./defaults/into.ts";
export type { MergeFunctions as DeepMergeFunctionsDefaults } from "./defaults/vanilla.ts";
export type {
  DeepMergeArraysDefaultHKT,
  DeepMergeBuiltInMetaData,
  DeepMergeHKT,
  DeepMergeLeaf,
  DeepMergeLeafURI,
  DeepMergeNoFilteringURI,
  DeepMergeMapsDefaultHKT,
  DeepMergeFunctionsDefaultURIs,
  DeepMergeFunctionsURIs,
  DeepMergeFunctionURItoKind,
  DeepMergeUtils,
  DeepMergeIntoFunctionUtils,
  DeepMergeFastUtils,
  DeepMergeIntoFastUtils,
  DeepMergeOptions,
  DeepMergeIntoOptions,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
  Reference as DeepMergeValueReference,
  GetDeepMergeFunctionsURIs,
} from "./types/index.ts";
export type { FilterOut } from "./types/utils.ts";
