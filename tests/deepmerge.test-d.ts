import { expectAssignable, expectType } from "tsd";

import {
  type DeepMergeMapsDefaultHKT,
  type DeepMergeNoFilteringURI,
  type DeepMergeSetsDefaultHKT,
  deepmerge,
  deepmergeCustom,
} from "../src/index.ts";

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

const test1 = deepmerge(a, b);
expectType<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: number;
  grault: number;
}>(test1);

type T = {
  readonly foo: string;
  bar?: string;
};

// eslint-disable-next-line ts/consistent-type-definitions
interface I {
  readonly foo: string;
  bar?: string;
}

const test2 = deepmerge(a as T, b as T);
expectType<{ foo: string; bar?: string }>(test2);

type U = {
  bar?: string;
};

const test3 = deepmerge(a as T, b as U);
expectType<{ foo: string; bar?: string }>(test3);

const c = {
  bar: "123",
  quux: "456",
  garply: 42,
} as const;

const test4 = deepmerge(a, c);
expectType<{
  foo: string;
  baz: { quux: string[] };
  garply: 42;
  bar: "123";
  quux: "456";
}>(test4);

const test5 = deepmerge(b, c);
expectType<{
  foo: string;
  baz: { corge: number };
  garply: 42;
  grault: number;
  bar: "123";
  quux: "456";
}>(test5);

const test6 = deepmerge(a, b, c);
expectType<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: 42;
  grault: number;
  bar: "123";
  quux: "456";
}>(test6);

// Allow arbitrary arrays of objects to be passes even if we can't determine anything about the result.
const abc = [a, b, c];

const test7 = deepmerge(...abc);
expectType<unknown>(test7);

const d = {
  bar: "abc",
  quux: "def",
  garply: 5,
} as const;

const test8 = deepmerge(c, d);
expectType<{ garply: 5; bar: "abc"; quux: "def" }>(test8);

type E = Readonly<{ foo: ReadonlyArray<number> }>;
type F = Readonly<{ foo: ReadonlyArray<string> }>;

const e = {
  foo: [1, 2, 3],
} as const;

const f = {
  foo: ["a", "b", "c"],
} as const;

const test9 = deepmerge(e, f);
expectType<{ foo: [1, 2, 3, "a", "b", "c"] }>(test9);

const test10 = deepmerge(e, f, f);
expectType<{ foo: [1, 2, 3, "a", "b", "c", "a", "b", "c"] }>(test10);

const test11 = deepmerge(e as E, f as F);
expectType<{ foo: Array<string | number> }>(test11);

const g = {
  key1: "key1-val",
  key2: {
    key2key1: [false, "true"],
  },
  key3: {
    key3key1: {
      key3key1key1: "key3key1key1-val",
      key3key1key2: true,
      key3key1key3: ["key3key1key3-val"],
    },
    key3key2: ["key3key2-val"],
  },
};

const h = {
  key1: ["key1-val"],
  key2: {
    key2key1: {
      key2key1key1: () => "key2key1key1-val",
      key2key1key2: true,
      key2key1key3: ["key2key1key3-val"],
    },
  },
  key3: {
    key3key1: () => false,
    key3key2: ["key3key2-val", true],
  },
};

const test12 = deepmerge(g, h);
expectType<{
  key1: string[];
  key2: {
    key2key1: {
      key2key1key1: () => string;
      key2key1key2: boolean;
      key2key1key3: string[];
    };
  };
  key3: { key3key1: () => boolean; key3key2: Array<string | boolean> };
}>(test12);

const i = {
  foo: undefined,
};

const test13 = deepmerge(a, i);
expectType<{ foo: string; baz: { quux: string[] }; garply: number }>(test13);

const j = {
  foo: new Set([1, 2]),
  bar: new Map([
    ["key1", "value1"],
    ["key2", "value2"],
  ]),
};

const k = {
  foo: new Set(["abc", "xyz"]),
  bar: new Map([
    [1, 1],
    [2, 2],
  ]),
};

const test14 = deepmerge(j, k);

expectType<{
  foo: DeepMergeSetsDefaultHKT<[Set<number>, Set<string>]>;
  bar: DeepMergeMapsDefaultHKT<[Map<string, string>, Map<number, number>]>;
}>(test14);
expectAssignable<{
  foo: Set<string | number>;
  bar: Map<string | number, string | number>;
}>(test14);

const l = new Map([[1, new Map([[1, a]])]]);
const m = new Map([[1, new Map([[1, b]])]]);

const test15 = deepmerge(l, m);

expectType<
  DeepMergeMapsDefaultHKT<
    [
      Map<number, Map<number, { foo: string; baz: { quux: string[] }; garply: number }>>,
      Map<number, Map<number, { foo: string; baz: { corge: number }; grault: number }>>,
    ]
  >
>(test15);
expectAssignable<
  Map<
    number,
    | Map<number, { foo: string; baz: { quux: string[] }; garply: number }>
    | Map<number, { foo: string; baz: { corge: number }; grault: number }>
  >
>(test15);

const first = { first: true };
const second = { second: false };
const third = { third: 123 };
const fourth = { fourth: "abc" };

const test16 = deepmerge(first, second, third, fourth);
expectType<{ first: boolean; second: boolean; third: number; fourth: string }>(test16);

const n: { a: true; b: string } = { a: true, b: "n" };
const o: { a: false; b?: number } = { a: false };

const test17 = deepmerge(n, o);
expectType<{ a: false; b: string | number }>(test17);

const p: { a: true; b?: string } = { a: true, b: "n" };

const test18 = deepmerge(o, p);
expectType<{ a: true; b?: string | number }>(test18);

const q: Record<string, string> = { a: "a" };

const test19 = deepmerge(q, q);
expectType<Record<string, string>>(test19);

const test20 = deepmerge({}, a);
expectType<{
  foo: string;
  baz: {
    quux: string[];
  };
  garply: number;
}>(test20);

// eslint-disable-next-line ts/no-confusing-void-expression
const test21 = deepmerge();
expectType<undefined>(test21);

const test22 = deepmerge({} as any, {} as any);
expectType<unknown>(test22);

const r: { a?: string; b?: number; c?: boolean } = { a: "a", b: 1 };
const test23 = deepmerge(r, r);
expectType<{ a?: string; b?: number; c?: boolean }>(test23);

const s: { foo: number | undefined } = { foo: undefined };
const test24 = deepmerge(a, s);
expectType<{ foo: string | number; baz: { quux: string[] }; garply: number }>(test24);

const test25 = deepmergeCustom<
  unknown,
  {
    DeepMergeFilterValuesURI: DeepMergeNoFilteringURI;
  }
>({ filterValues: false })(a, s);
expectType<{ foo: number | undefined; baz: { quux: string[] }; garply: number }>(test25);

const tt: T = { foo: "abc" };
const ti: I = { foo: "abc" };

const test26 = deepmerge(tt, tt as Partial<typeof tt>);
expectType<{ foo: string; bar?: string }>(test26);

const test27 = deepmerge(ti, ti as Partial<typeof ti>);
// Interfaces are not merged like type aliases.
expectType<Partial<I>>(test27);

// eslint-disable-next-line ts/consistent-type-definitions
interface IndexableInterface {
  [key: PropertyKey]: unknown;
  readonly foo: string;
  bar?: string;
}

const tiIndexable: IndexableInterface = { foo: "abc" };

const test28 = deepmerge(tiIndexable, tiIndexable as Partial<typeof tiIndexable>);
expectType<{ foo: string; bar?: string }>(test28);

const u: { outer: { inner: number } } = { outer: { inner: 1 } };
const v: { outer?: { inner?: number } } = {};
const test29 = deepmerge(u, v);
expectType<{ outer: { inner: number } }>(test29);

const w: { foo: string; bar: number; nested: { baz: boolean } } = { foo: "abc", bar: 1, nested: { baz: true } };

// Merging values of the same type returns that type.
const test30 = deepmerge(w, w);
expectType<{ foo: string; bar: number; nested: { baz: boolean } }>(test30);

const test31 = deepmerge(w, w, w);
expectType<{ foo: string; bar: number; nested: { baz: boolean } }>(test31);

const opt: { a?: string; b?: number } = { a: "a" };

const test32 = deepmerge(opt, opt);
expectType<{ a?: string; b?: number }>(test32);

const mt: { list: number[]; set: Set<string>; map: Map<string, number> } = {
  list: [],
  set: new Set(),
  map: new Map(),
};

const test33 = deepmerge(mt, mt);
expectType<{ list: number[]; set: Set<string>; map: Map<string, number> }>(test33);

// Merging values of the same type that is not sound to shortcut computes the
// actual merge result.
const tup: [number, string] = [1, "a"];

const test34 = deepmerge(tup, tup);
expectType<[number, string, number, string]>(test34);

const ra: ReadonlyArray<number> = [1];
const rb: ReadonlyArray<number> = [2];

const test35 = deepmerge(ra, rb);
expectType<number[]>(test35);

const nd: { a: string | undefined } = { a: undefined };

const test36 = deepmerge(nd, nd);
expectType<{ a: string }>(test36);

// Merging values of the same type that has readonly properties computes the
// actual merge result, which strips the readonly modifiers.
const ro: { readonly a: string } = { a: "x" };

const test37 = deepmerge(ro, ro);
expectType<{ a: string }>(test37);

type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

// `expectType` cannot distinguish readonly from mutable (they are mutually
// assignable), so assert the readonly modifier is gone with an exact check.
const test37ReadonlyStripped: IsEqual<typeof test37, { a: string }> = true;
expectType<true>(test37ReadonlyStripped);
