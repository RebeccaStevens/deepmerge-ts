export { deepmerge, deepmergeCustom } from "./deepmerge";
export { deepmergeInto, deepmergeIntoCustom } from "./deepmerge-into";
export {
  type ObjectType,
  getKeys,
  getObjectType,
  objectHasProperty,
} from "./utils";

export type { MergeFunctions as DeepMergeMergeIntoFunctionsDefaults } from "./defaults/into";
export type { MergeFunctions as DeepMergeMergeFunctionsDefaults } from "./defaults/vanilla";
export type {
  DeepMergeArraysDefaultHKT,
  DeepMergeBuiltInMetaData,
  DeepMergeHKT,
  DeepMergeLeaf,
  DeepMergeLeafURI,
  DeepMergeNoFilteringURI,
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
  GetDeepMergeMergeFunctionsURIs,
} from "./types";
export type { FilterOut } from "./types/utils";
