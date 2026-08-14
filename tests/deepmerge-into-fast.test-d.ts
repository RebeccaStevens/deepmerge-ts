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
    mut_target.value = values.at(-1);
  },
});

const target2 = { ...a };
customInto(target2, b);

const same: { foo: string; bar: number } = { foo: "abc", bar: 1 };

// Merging values of the same type into a target returns the target's type.
deepmergeIntoFastUnsafe(same, same);
expectType<{ foo: string; bar: number }>(same);
