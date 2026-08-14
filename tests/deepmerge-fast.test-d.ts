import { expectType } from "tsd";

import { deepmergeFastUnsafe, deepmergeFastUnsafeCustom } from "../src/index.ts";

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

const test1 = deepmergeFastUnsafe(a, b);
expectType<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: number;
  grault: number;
}>(test1);

const customMerge = deepmergeFastUnsafeCustom({
  mergeOthers: (values, utils, meta) => {
    expectType<undefined>(meta);
    return values.at(-1);
  },
});

const testCustom = customMerge(a, b);
expectType<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: number;
  grault: number;
}>(testCustom);

const same: { foo: string; bar: number } = { foo: "abc", bar: 1 };

// Merging values of the same type returns that type.
const testSame = deepmergeFastUnsafe(same, same);
expectType<{ foo: string; bar: number }>(testSame);
