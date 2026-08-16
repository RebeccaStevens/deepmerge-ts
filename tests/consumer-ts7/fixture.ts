// Consumer-style TypeScript 7 type check.
//
// This fixture is type-checked with the TypeScript 7 `tsc` against the built
// `dist/index.d.mts` (via the package `exports` map) to verify that the shipped
// declarations work for consumers on TypeScript 7, including the stable type
// ordering that TypeScript 7 enables by default.
//
// Run manually with: `pnpm run typecheck:consumer-ts7`.
import { deepmerge, deepmergeCustom, deepmergeIntoCustom } from "deepmerge-ts";
import type { DeepMergeNoFilteringURI, FilterOut } from "deepmerge-ts";

// Consumers register custom merge functions by augmenting DeepMergeFunctionURItoKind.
declare module "deepmerge-ts" {
  interface DeepMergeFunctionURItoKind<Ts extends ReadonlyArray<unknown>, Fs extends DeepMergeFunctionsURIs, M> {
    readonly CustomFilterValues1: Ts;
  }
}

const left = {
  a: 1,
  nested: { list: ["x"], set: new Set([1]), map: new Map([["k", "v"]]) },
  maybe: undefined as string | undefined,
};
const right = {
  a: 2,
  nested: { list: ["y"], set: new Set([2]), map: new Map([["k2", "v2"]]) },
  maybe: "hello",
};

const merged = deepmerge(left, right);
const mergedNested: { list: string[] } = merged.nested;

const customFilter = deepmergeCustom<unknown, { DeepMergeFilterValuesURI: "CustomFilterValues1" }>({
  filterValues(values) {
    return values.filter((value) => value !== null);
  },
});
const customMerged = customFilter(left, right);

const noFilter = deepmergeCustom<unknown, { DeepMergeFilterValuesURI: DeepMergeNoFilteringURI }>({
  filterValues: false,
});
const noFilterMerged = noFilter(left, right);

const target = {} as { a?: number };
const mergeInto = deepmergeIntoCustom({});
mergeInto(target, left, right);

type Filtered = FilterOut<[1, undefined, 2], undefined>;

export { merged, mergedNested, customMerged, noFilterMerged, Filtered };
