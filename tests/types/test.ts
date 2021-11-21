import { deepmerge } from "../../src/";

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

// $ExpectType { foo: string; baz: { quux: string[]; corge: number; }; garply: number; grault: number; }
deepmerge(a, b);

type T = {
  readonly foo: string;
  bar?: string;
};

// $ExpectType { foo: string; bar?: string; }
deepmerge(a as T, b as T);

type U = {
  bar?: string;
};

// $ExpectType { foo: string; bar?: string; }
deepmerge(a as T, b as U);

const c = {
  bar: "123",
  quux: "456",
  garply: 42,
} as const;

// $ExpectType { foo: string; baz: { quux: string[]; }; garply: 42; quux: "456"; bar: "123"; }
deepmerge(a, c);

// $ExpectType { foo: string; baz: { corge: number; }; garply: 42; grault: number; quux: "456"; bar: "123"; }
deepmerge(b, c);

// $ExpectType { foo: string; baz: { quux: string[]; corge: number; }; garply: 42; grault: number; quux: "456"; bar: "123"; }
deepmerge(a, b, c);

// Allow arbitrary arrays of objects to be passes even if we can't determine anything about the result.
const abc = [a, b, c];
// $ExpectType unknown
deepmerge(...abc);

const d = {
  bar: "abc",
  quux: "def",
  garply: 5,
} as const;

// $ExpectType { garply: 5; quux: "def"; bar: "abc"; }
deepmerge(c, d);

type E = { readonly foo: ReadonlyArray<number> };
type F = { readonly foo: ReadonlyArray<string> };

const e = {
  foo: [1, 2, 3],
} as const;

const f = {
  foo: ["a", "b", "c"],
} as const;

// $ExpectType { foo: [1, 2, 3, "a", "b", "c"]; }
deepmerge(e, f);

// $ExpectType { foo: [1, 2, 3, "a", "b", "c", "a", "b", "c"]; }
deepmerge(e, f, f);

// $ExpectType { foo: (string | number)[]; }
deepmerge(e as E, f as F);

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

// $ExpectType { key1: string[]; key2: { key2key1: { key2key1key1: () => string; key2key1key2: boolean; key2key1key3: string[]; }; }; key3: { key3key1: () => boolean; key3key2: (string | boolean)[]; }; }
deepmerge(g, h);

const i = {
  foo: undefined,
};

// $ExpectType { foo: undefined; baz: { quux: string[]; }; garply: number; }
deepmerge(a, i);

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

const merged1: {
  foo: Set<string | number>;
  bar: Map<string | number, string | number>;
} =
  // $ExpectType { foo: DeepMergeSetsDefaultHKT<[Set<number>, Set<string>], Readonly<{ DeepMergeRecordsURI: "DeepMergeRecordsDefaultURI"; DeepMergeArraysURI: "DeepMergeArraysDefaultURI"; DeepMergeSetsURI: "DeepMergeSetsDefaultURI"; DeepMergeMapsURI: "DeepMergeMapsDefaultURI"; DeepMergeOthersURI: "DeepMergeLeafURI"; }>>; bar: DeepMergeMapsDefaultHKT<[Map<string, string>, Map<number, number>], Readonly<{ DeepMergeRecordsURI: "DeepMergeRecordsDefaultURI"; DeepMergeArraysURI: "DeepMergeArraysDefaultURI"; DeepMergeSetsURI: "DeepMergeSetsDefaultURI"; DeepMergeMapsURI: "DeepMergeMapsDefaultURI"; DeepMergeOthersURI: "DeepMergeLeafURI"; }>>; }
  deepmerge(j, k);

const l = new Map([[1, new Map([[1, a]])]]);
const m = new Map([[1, new Map([[1, b]])]]);

const merged2: Map<
  number,
  | Map<number, { foo: string; baz: { quux: string[] }; garply: number }>
  | Map<number, { foo: string; baz: { corge: number }; grault: number }>
> =
  // $ExpectType DeepMergeMapsDefaultHKT<[Map<number, Map<number, { foo: string; baz: { quux: string[]; }; garply: number; }>>, Map<number, Map<number, { foo: string; baz: { corge: number; }; grault: number; }>>], Readonly<{ DeepMergeRecordsURI: "DeepMergeRecordsDefaultURI"; DeepMergeArraysURI: "DeepMergeArraysDefaultURI"; DeepMergeSetsURI: "DeepMergeSetsDefaultURI"; DeepMergeMapsURI: "DeepMergeMapsDefaultURI"; DeepMergeOthersURI: "DeepMergeLeafURI"; }>>
  deepmerge(l, m);

const first = { first: true };
const second = { second: false };
const third = { third: 123 };
const fourth = { fourth: "abc" };

// $ExpectType { first: boolean; second: boolean; third: number; fourth: string; }
const merged = deepmerge(first, second, third, fourth);
