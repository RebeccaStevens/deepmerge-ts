import { expectAssignable, expectType } from "tsd";

import { deepmergeInto } from "../src/index.ts";

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

const test1 = { ...a };
deepmergeInto(test1, b);
expectAssignable<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: number;
  grault: number;
}>(test1);

type T = {
  readonly foo: string;
  bar?: string;
};

const test2 = { ...a } as T;
deepmergeInto(test2, b as T);
expectType<T>(test2);

type U = {
  grault: number;
};

const test3 = { ...a } as T;
deepmergeInto(test3, b as U);
expectAssignable<{ foo: string; grault: number }>(test3);

const c = {
  bar: "123",
  quux: "456",
  garply: 42,
} as const;

const test4 = { ...a };
deepmergeInto(test4, c);
expectAssignable<{
  foo: string;
  baz: { quux: string[] };
  garply: 42;
  bar: "123";
  quux: "456";
}>(test4);

const test5 = { ...b };
deepmergeInto(test5, c);
expectAssignable<{
  foo: string;
  baz: { corge: number };
  garply: 42;
  grault: number;
  bar: "123";
  quux: "456";
}>(test5);

const test6 = { ...a };
deepmergeInto(test6, b, c);
expectAssignable<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: 42;
  grault: number;
  bar: "123";
  quux: "456";
}>(test6);

const d: { waldo: boolean; fred?: number } = { waldo: false };

const test7 = { ...a };
deepmergeInto(test7, d);
expectAssignable<{
  foo: string;
  baz: {
    quux: string[];
  };
  garply: number;
  waldo: boolean;
  fred?: number;
}>(test7);

const same: { foo: string; bar: number } = { foo: "abc", bar: 1 };

// Merging values of the same type into a target returns the target's type.
deepmergeInto(same, same);
expectType<{ foo: string; bar: number }>(same);

const testSetsMaps = {
  foo: new Set([1, 2]),
  bar: new Map([["key1", "value1"]]),
};
const sourceSetsMaps = {
  foo: new Set(["abc"]),
  bar: new Map([[1, 1]]),
};

// The target's container types are kept in the merge result.
deepmergeInto(testSetsMaps, sourceSetsMaps);
expectType<{ foo: Set<number>; bar: Map<string, string> }>(testSetsMaps);

const testReadonlyArr = { foo: [1] } as { foo: ReadonlyArray<number> };
const sourceReadonlyArr = { foo: [2] } as { foo: ReadonlyArray<number> };

// Readonly array properties stay readonly in the target's type.
deepmergeInto(testReadonlyArr, sourceReadonlyArr);
expectType<{ foo: ReadonlyArray<number> }>(testReadonlyArr);

const testUndefined = { foo: "abc" };

// undefined values are filtered out of the merge result.
deepmergeInto(testUndefined, { foo: undefined });
expectType<{ foo: string }>(testUndefined);

const testOptional = { foo: "abc", bar: 1 } as { foo: string; bar?: number };

// Optional properties are preserved.
deepmergeInto(testOptional, { foo: "x", bar: 2 } as { foo: string; bar?: number });
expectType<{ foo: string; bar?: number }>(testOptional);

const symA = Symbol("a");
const symB = Symbol("b");
const testSymbols = { [symA]: 1 };

// Symbol keys are merged into the target.
deepmergeInto(testSymbols, { [symB]: 2, [symA]: 3 });
expectAssignable<{ [symA]: number; [symB]: number }>(testSymbols);

const testNested = {
  outer: { inner: { a: 1 } },
} as { outer: { inner: { a: number; b?: number } } };
const sourceNested = {
  outer: { inner: { b: 2 } },
} as { outer: { inner: { a?: number; b?: number } } };

// Deeply nested objects are merged recursively.
deepmergeInto(testNested, sourceNested);
expectAssignable<{ outer: { inner: { a: number; b?: number } } }>(testNested);
