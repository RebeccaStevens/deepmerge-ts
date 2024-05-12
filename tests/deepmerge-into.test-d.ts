import { expectAssignable, expectType } from "tsd";

import { deepmergeInto } from "../src";

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
