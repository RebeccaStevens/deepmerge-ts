import { deepmergeCustom } from "deepmerge-ts";
import type {
  DeepMergeHKT,
  DeepMergeLeaf,
  DeepMergeMergeFunctionsURIs,
} from "deepmerge-ts";

type DeepMergeLeafNoUndefinedOverride<Ts extends ReadonlyArray<unknown>> =
  DeepMergeLeaf<FilterOutUnderfined<Ts>>;

type FilterOutUnderfined<T extends ReadonlyArray<unknown>> =
  FilterOutUnderfinedHelper<T, []>;

type FilterOutUnderfinedHelper<
  T extends ReadonlyArray<unknown>,
  Acc extends ReadonlyArray<unknown>
> = T extends readonly []
  ? Acc
  : T extends readonly [infer Head, ...infer Rest]
  ? Head extends undefined
    ? FilterOutUnderfinedHelper<Rest, Acc>
    : FilterOutUnderfinedHelper<Rest, [...Acc, Head]>
  : T;

declare module "deepmerge-ts" {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs,
    M
  > {
    readonly DeepMergeLeafNoUndefinedOverrideURI: DeepMergeLeafNoUndefinedOverride<Ts>;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

type DeepmergeDefined = <Ts extends ReadonlyArray<unknown>>(
  ...objects: Ts
) => DeepMergeHKT<
  Ts,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
  Readonly<{
    DeepMergeRecordsURI: "DeepMergeRecordsDefaultURI";
    DeepMergeArraysURI: "DeepMergeArraysDefaultURI";
    DeepMergeSetsURI: "DeepMergeSetsDefaultURI";
    DeepMergeMapsURI: "DeepMergeMapsDefaultURI";
    DeepMergeOthersURI: "DeepMergeLeafNoUndefinedOverrideURI";
  }>,
  Readonly<{
    key: PropertyKey;
    parents: ReadonlyArray<Readonly<Record<PropertyKey, unknown>>>;
  }>
>;

/**
 * Deeply merge objects.
 *
 * Does not override record values with `undefined`.
 *
 * @example
 * // returns { foo: 1 }
 * deepmergeDefined({ foo: 1 }, { foo: undefined });
 *
 * @param objects - The objects to merge.
 */
export const deepmergeDefined: DeepmergeDefined = deepmergeCustom({
  mergeOthers: (values, utils) =>
    utils.defaultMergeFunctions.mergeOthers(
      values.filter((v) => v !== undefined)
    ),
}) as DeepmergeDefined;
