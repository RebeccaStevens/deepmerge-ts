import { expectType } from "tsd";

import { type DeepMergeBuiltInMetaData, type DeepMergeNoFilteringURI, deepmergeCustom } from "../src/index.ts";

const a = {
  foo: "abc",
  baz: {
    quux: ["def", "ghi"],
  },
  garply: 42,
};

const b = {
  foo: "cba",
  baz: {
    corge: 96,
  },
  grault: 42,
};

// Custom merge functions receive typed utils and built-in meta.
const merge = deepmergeCustom({
  mergeOthers: (values, utils, meta) => {
    expectType<DeepMergeBuiltInMetaData | undefined>(meta);
    expectType<symbol>(utils.actions.defaultMerge);
    expectType<symbol>(utils.actions.skip);
    return values.at(-1);
  },
});

const testCustom = merge(a, b);
expectType<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: number;
  grault: number;
}>(testCustom);

// Returning actions.skip from a custom merge function skips the property.
const skipMerge = deepmergeCustom({
  mergeOthers: (values, utils) => utils.actions.skip,
});

const testSkip = skipMerge({ a: 1 }, { b: 2 });
expectType<{ a: number; b: number }>(testSkip);

// enableImplicitDefaultMerging is a valid option.
const implicitMerge = deepmergeCustom({ enableImplicitDefaultMerging: true });

const testImplicit = implicitMerge(a, b);
expectType<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: number;
  grault: number;
}>(testImplicit);

// Custom merge functions for circular references receive cyclic depths.
const circularMerge = deepmergeCustom({
  mergeCircularReferences: (values, cyclicDepths, utils, meta) => {
    expectType<ReadonlyArray<number>>(cyclicDepths);
    expectType<DeepMergeBuiltInMetaData | undefined>(meta);
    return utils.actions.skip;
  },
});

const testCircular = circularMerge(a, b);
expectType<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: number;
  grault: number;
}>(testCircular);

// filterValues: false preserves undefined values (DeepMergeNoFilteringURI).
const s: { foo: number | undefined } = { foo: undefined };

const noFilter = deepmergeCustom<unknown, { DeepMergeFilterValuesURI: DeepMergeNoFilteringURI }>({
  filterValues: false,
});
const testNoFilter = noFilter(a, s);
expectType<{ foo: number | undefined; baz: { quux: string[] }; garply: number }>(testNoFilter);

// metaDataUpdater can track custom meta data via the rootMetaData overload.
const pathMerge = deepmergeCustom<unknown, {}, { path: string[] }>({
  metaDataUpdater: (previousMeta, mergeInfo) => ({
    path: [...(previousMeta?.path ?? []), String(mergeInfo.key)],
  }),
});

const testPath = pathMerge({ a: 1 }, { a: 2 });
expectType<{ a: number }>(testPath);

// @ts-expect-error - unknown options are rejected.
deepmergeCustom({ mergeX: () => undefined });
