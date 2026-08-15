export { deepmerge, deepmergeCustom } from "./deepmerge.ts";
export { deepmergeFastUnsafe, deepmergeFastUnsafeCustom } from "./deepmerge-fast.ts";
export { deepmergeInto, deepmergeIntoCustom } from "./deepmerge-into.ts";
export { deepmergeIntoFastUnsafe, deepmergeIntoFastUnsafeCustom } from "./deepmerge-into-fast.ts";
export { type ObjectType, getKeys, getKeysOfObjects, getObjectType, objectHasProperty } from "./utils.ts";

export type { MergeFunctions as DeepMergeIntoFunctionsDefaults } from "./defaults/into.ts";
export type { MergeFunctionsFast as DeepMergeIntoFunctionsDefaultsFastUnsafe } from "./defaults/into-fast.ts";
export type { MergeFunctions as DeepMergeFunctionsDefaults } from "./defaults/vanilla.ts";
export type { MergeFunctionsFast as DeepMergeFunctionsDefaultsFastUnsafe } from "./defaults/vanilla-fast.ts";
export type {
  DeepMergeArraysDefaultHKT,
  DeepMergeBuiltInMetaData,
  DeepMergeCircularReferencesDefaultHKT,
  DeepMergeFilterValuesDefaultHKT,
  DeepMergeHKT,
  DeepMergeLeaf,
  DeepMergeLeafURI,
  DeepMergeNoFilteringURI,
  DeepMergeMapsDefaultHKT,
  DeepMergeMetaData,
  DeepMergeMergeInfo,
  DeepMergeFunctionsDefaultURIs,
  DeepMergeFunctionsURIs,
  DeepMergeFunctionURItoKind,
  DeepMergeUtils,
  DeepMergeFastUnsafeUtils,
  DeepMergeIntoUtils,
  DeepMergeIntoFastUnsafeUtils,
  DeepMergeOptions,
  DeepMergeFastUnsafeOptions,
  DeepMergeIntoOptions,
  DeepMergeIntoFastUnsafeOptions,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
  DeepMergeValueReference,
  GetDeepMergeFunctionsURIs,
} from "./types/index.ts";
export type { FilterOut } from "./types/utils.ts";
