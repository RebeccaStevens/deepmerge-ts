export { deepmerge, deepmergeCustom } from "./deepmerge";
export { deepmergeInto, deepmergeIntoCustom } from "./deepmerge-into";
export {
  type ObjectType,
  getKeys,
  getObjectType,
  objectHasProperty,
} from "./utils";

export type { MergeFunctions as DeepMergeIntoFunctionsDefaults } from "./defaults/into";
export type { MergeFunctions as DeepMergeFunctionsDefaults } from "./defaults/vanilla";
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
  DeepMergeFunctionUtils,
  DeepMergeIntoFunctionUtils,
  DeepMergeOptions,
  DeepMergeIntoOptions,
  DeepMergeRecordsDefaultHKT,
  DeepMergeSetsDefaultHKT,
  Reference as DeepMergeValueReference,
  GetDeepMergeFunctionsURIs,
} from "./types";
export type { FilterOut } from "./types/utils";
