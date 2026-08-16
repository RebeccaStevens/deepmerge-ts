import { expectAssignable, expectType } from "tsd";

import { deepmergeIntoFastUnsafe, deepmergeIntoFastUnsafeCustom } from "../src/index.ts";

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

const target = { ...a };
deepmergeIntoFastUnsafe(target, b);
expectAssignable<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: number;
  grault: number;
}>(target);

const customInto = deepmergeIntoFastUnsafeCustom({
  mergeOthers: (mut_target, values, utils, meta) => {
    expectType<undefined>(meta);
    expectType<symbol>(utils.actions.defaultMerge);
    mut_target.value = values.at(-1);
  },
});

const target2 = { ...a };
customInto(target2, b);

const same: { foo: string; bar: number } = { foo: "abc", bar: 1 };

// Merging values of the same type into a target returns the target's type.
deepmergeIntoFastUnsafe(same, same);
expectType<{ foo: string; bar: number }>(same);

const sameContainers = {
  foo: new Set([1, 2]),
  bar: new Map([
    ["key1", "value1"],
    ["key2", "value2"],
  ]),
};

// Merging values of the same type into a target keeps the target's container types.
deepmergeIntoFastUnsafe(sameContainers, sameContainers);
expectType<{ foo: Set<number>; bar: Map<string, string> }>(sameContainers);

const readonlyTarget = { foo: [1] } as { foo: ReadonlyArray<number> };

// Readonly array properties stay readonly in the target's type.
deepmergeIntoFastUnsafe(readonlyTarget, readonlyTarget);
expectType<{ foo: ReadonlyArray<number> }>(readonlyTarget);

const undefTarget = { foo: "abc" };

// undefined values are filtered out of the merge result.
deepmergeIntoFastUnsafe(undefTarget, { foo: undefined });
expectType<{ foo: string }>(undefTarget);

const optTarget = { foo: "abc", bar: 1 } as { foo: string; bar?: number };

// Optional properties are preserved.
deepmergeIntoFastUnsafe(optTarget, optTarget);
expectType<{ foo: string; bar?: number }>(optTarget);

const symA = Symbol("a");
const symB = Symbol("b");
const symTarget = { [symA]: 1 };

// Symbol keys are merged into the target.
deepmergeIntoFastUnsafe(symTarget, { [symB]: 2, [symA]: 3 });
expectAssignable<{ [symA]: number; [symB]: number }>(symTarget);

// @ts-expect-error - maxDepth is not available in fast mode.
deepmergeIntoFastUnsafeCustom({ maxDepth: 10 });

// @ts-expect-error - metaDataUpdater is not available in fast mode.
deepmergeIntoFastUnsafeCustom({ metaDataUpdater: () => undefined });

// @ts-expect-error - unknown options are rejected.
deepmergeIntoFastUnsafeCustom({ mergeX: () => undefined });
