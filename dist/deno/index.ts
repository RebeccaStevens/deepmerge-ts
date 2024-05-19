export { deepmerge, deepmergeCustom } from "./deepmerge.ts";
export { deepmergeInto, deepmergeIntoCustom } from "./deepmerge-into.ts";
export {
  type ObjectType,
  getKeys,
  getObjectType,
  objectHasProperty,
} from "./utils.ts";

export type { MergeFunctions as DeepMergeMergeIntoFunctionsDefaults } from "./defaults/into.ts";
export type { MergeFunctions as DeepMergeMergeFunctionsDefaults } from "./defaults/vanilla.ts";
export type {
  DeepMergeArraysDefaultHKT,
  DeepMergeBuiltInMetaData,
  DeepMergeHKT,
  DeepMergeLeaf,
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
  GetDeepMergeMergeFunctionsURIs,
} from "./types/index.ts";
