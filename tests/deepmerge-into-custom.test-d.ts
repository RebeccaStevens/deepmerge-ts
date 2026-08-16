import { expectType } from "tsd";

import { type DeepMergeBuiltInMetaData, deepmergeIntoCustom } from "../src/index.ts";

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

// Custom into merge functions receive typed utils and built-in meta.
const mergeInto = deepmergeIntoCustom({
  mergeOthers: (mut_target, values, utils, meta) => {
    expectType<DeepMergeBuiltInMetaData | undefined>(meta);
    expectType<symbol>(utils.actions.defaultMerge);
    mut_target.value = values.at(-1);
  },
});

const target = { ...a };
mergeInto(target, b);
expectType<{ foo: string; baz: { quux: string[] }; garply: number }>(target);

// Returning actions.defaultMerge falls back to the default merge behavior.
const defaultMergeInto = deepmergeIntoCustom({
  mergeSets: (mut_target, values, utils) => utils.actions.defaultMerge,
});

const setTarget = { foo: new Set([1, 2]) };
defaultMergeInto(setTarget, { foo: new Set(["abc"]) });
expectType<{ foo: Set<number> }>(setTarget);

// filterValues: false disables undefined filtering.
const noFilterInto = deepmergeIntoCustom({ filterValues: false });

const undefTarget = { foo: "abc" };
noFilterInto(undefTarget, { foo: undefined });
expectType<{ foo: string }>(undefTarget);

// metaDataUpdater can track custom meta data via the rootMetaData overload.
const pathMergeInto = deepmergeIntoCustom<unknown, { path: string[] }>({
  metaDataUpdater: (previousMeta, mergeInfo) => ({
    path: [...(previousMeta?.path ?? []), String(mergeInfo.key)],
  }),
});

const target2 = { a: 1 };
pathMergeInto(target2, { b: 2 });
expectType<{ a: number }>(target2);

// @ts-expect-error - unknown options are rejected.
deepmergeIntoCustom({ mergeX: () => undefined });
