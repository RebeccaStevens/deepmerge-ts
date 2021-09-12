import type {
  DeepMergeRecordsDefaultHKT,
  DeepMergeArraysDefaultHKT,
  DeepMergeSetsDefaultHKT,
  DeepMergeMapsDefaultHKT,
} from "./defaults";
import type {
  EveryIsArray,
  EveryIsMap,
  EveryIsRecord,
  EveryIsSet,
  IsNever,
  IsTuple,
} from "./utils";

/**
 * Mapping of merge function URIs to the merge function type.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface DeepMergeMergeFunctionURItoKind<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs
> {
  readonly DeepMergeLeafURI: DeepMergeLeafHKT<Ts, MF>;
  readonly DeepMergeRecordsDefaultURI: DeepMergeRecordsDefaultHKT<Ts, MF>;
  readonly DeepMergeArraysDefaultURI: DeepMergeArraysDefaultHKT<Ts, MF>;
  readonly DeepMergeSetsDefaultURI: DeepMergeSetsDefaultHKT<Ts, MF>;
  readonly DeepMergeMapsDefaultURI: DeepMergeMapsDefaultHKT<Ts, MF>;
}

/**
 * Get the type of the given merge function via its URI.
 */
type DeepMergeMergeFunctionKind<
  URI extends DeepMergeMergeFunctionURIs,
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs
> = DeepMergeMergeFunctionURItoKind<Ts, MF>[URI];

/**
 * A union of all valid merge function URIs.
 */
type DeepMergeMergeFunctionURIs = keyof DeepMergeMergeFunctionURItoKind<
  ReadonlyArray<unknown>,
  DeepMergeMergeFunctionsURIs
>;

/**
 * The merge functions to use when deep merging.
 */
export type DeepMergeMergeFunctionsURIs = {
  /**
   * The merge function to merge records with.
   */
  DeepMergeRecordsURI: DeepMergeMergeFunctionURIs;

  /**
   * The merge function to merge arrays with.
   */
  DeepMergeArraysURI: DeepMergeMergeFunctionURIs;

  /**
   * The merge function to merge sets with.
   */
  DeepMergeSetsURI: DeepMergeMergeFunctionURIs;

  /**
   * The merge function to merge maps with.
   */
  DeepMergeMapsURI: DeepMergeMergeFunctionURIs;

  /**
   * The merge function to merge other things with.
   */
  DeepMergeOthersURI: DeepMergeMergeFunctionURIs;
};

/**
 * Deep merge types.
 */
export type DeepMergeHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs
> = IsTuple<Ts> extends true
  ? Ts extends readonly []
    ? undefined
    : Ts extends readonly [infer T1]
    ? T1
    : EveryIsArray<Ts> extends true
    ? DeepMergeArraysHKT<Ts, MF>
    : EveryIsMap<Ts> extends true
    ? DeepMergeMapsHKT<Ts, MF>
    : EveryIsSet<Ts> extends true
    ? DeepMergeSetsHKT<Ts, MF>
    : EveryIsRecord<Ts> extends true
    ? DeepMergeRecordsHKT<Ts, MF>
    : DeepMergeOthersHKT<Ts, MF>
  : unknown;

/**
 * Deep merge records.
 */
type DeepMergeRecordsHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs
> = DeepMergeMergeFunctionKind<MF["DeepMergeRecordsURI"], Ts, MF>;

/**
 * Deep merge arrays.
 */
type DeepMergeArraysHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs
> = DeepMergeMergeFunctionKind<MF["DeepMergeArraysURI"], Ts, MF>;

/**
 * Deep merge sets.
 */
type DeepMergeSetsHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs
> = DeepMergeMergeFunctionKind<MF["DeepMergeSetsURI"], Ts, MF>;

/**
 * Deep merge maps.
 */
type DeepMergeMapsHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs
> = DeepMergeMergeFunctionKind<MF["DeepMergeMapsURI"], Ts, MF>;

/**
 * Deep merge other things.
 */
type DeepMergeOthersHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs
> = DeepMergeMergeFunctionKind<MF["DeepMergeOthersURI"], Ts, MF>;

/**
 * The merge function that returns a leaf.
 */
export type DeepMergeLeafURI = "DeepMergeLeafURI";

/**
 * Get the leaf type from 2 types that can't be merged.
 */
export type DeepMergeLeafHKT<
  Ts extends ReadonlyArray<unknown>,
  MF extends DeepMergeMergeFunctionsURIs
> = Leaf<Ts>;

/**
 * Get the leaf type from many types that can't be merged.
 */
export type Leaf<Ts extends ReadonlyArray<unknown>> = Ts extends []
  ? never
  : Ts extends [infer T]
  ? T
  : Ts extends [...infer Rest, infer Tail]
  ? IsNever<Tail> extends true
    ? Rest extends ReadonlyArray<unknown>
      ? Leaf<Rest>
      : never
    : Tail
  : never;
