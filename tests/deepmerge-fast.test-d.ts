import { expectAssignable, expectType } from "tsd";

import { type DeepMergeNoFilteringURI, deepmergeFastUnsafe, deepmergeFastUnsafeCustom } from "../src/index.ts";

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

const c = {
  bar: "123",
  quux: "456",
  garply: 42,
} as const;

const testConst = deepmergeFastUnsafe(a, c);
expectType<{
  foo: string;
  baz: { quux: string[] };
  garply: 42;
  bar: "123";
  quux: "456";
}>(testConst);

const e = { foo: [1, 2, 3] } as const;
const f = { foo: ["a", "b", "c"] } as const;

// Tuples are concatenated.
const testTuples = deepmergeFastUnsafe(e, f);
expectType<{ foo: [1, 2, 3, "a", "b", "c"] }>(testTuples);

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

// Sets and maps merge to their union types.
const testSetsMaps = deepmergeFastUnsafe(j, k);
expectAssignable<{
  foo: Set<string | number>;
  bar: Map<string | number, string | number>;
}>(testSetsMaps);

const ra: ReadonlyArray<number> = [1];
const rb: ReadonlyArray<number> = [2];

// Readonly arrays lose the readonly modifier.
const testReadonlyArr = deepmergeFastUnsafe(ra, rb);
expectType<number[]>(testReadonlyArr);

type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

const ro: { readonly a: string } = { a: "x" };

// Merging values of the same type that has readonly properties computes the
// actual merge result, which strips the readonly modifiers.
const testReadonlyStripped = deepmergeFastUnsafe(ro, ro);
expectType<{ a: string }>(testReadonlyStripped);
const readonlyStrippedExact: IsEqual<typeof testReadonlyStripped, { a: string }> = true;
expectType<true>(readonlyStrippedExact);

const opt: { a?: string; b?: number } = { a: "a" };

// Optional properties are preserved.
const testOptional = deepmergeFastUnsafe(opt, opt);
expectType<{ a?: string; b?: number }>(testOptional);

const symA = Symbol("a");
const symB = Symbol("b");

// Symbol keys are merged.
const testSymbols = deepmergeFastUnsafe({ [symA]: 1 }, { [symB]: 2, [symA]: 3 });
expectType<{ [symA]: number; [symB]: number }>(testSymbols);

// Three or more objects are merged.
const testMany = deepmergeFastUnsafe(a, b, c);
expectType<{
  foo: string;
  baz: { quux: string[]; corge: number };
  garply: 42;
  grault: number;
  bar: "123";
  quux: "456";
}>(testMany);

const skipMerge = deepmergeFastUnsafeCustom({
  mergeOthers: (values, utils, meta) => {
    expectType<undefined>(meta);
    expectType<symbol>(utils.actions.defaultMerge);
    expectType<symbol>(utils.actions.skip);
    return utils.actions.skip;
  },
});

// Returning actions.skip from a custom merge function skips the property.
const testSkip = skipMerge({ a: 1 }, { b: 2 });
expectType<{ a: number; b: number }>(testSkip);

// filterValues: false preserves undefined values (DeepMergeNoFilteringURI).
const s: { foo: number | undefined } = { foo: undefined };

const noFilter = deepmergeFastUnsafeCustom<unknown, { DeepMergeFilterValuesURI: DeepMergeNoFilteringURI }>({
  filterValues: false,
});
const testNoFilter = noFilter(a, s);
expectType<{ foo: number | undefined; baz: { quux: string[] }; garply: number }>(testNoFilter);

// @ts-expect-error - maxDepth is not available in fast mode.
deepmergeFastUnsafeCustom({ maxDepth: 10 });

// @ts-expect-error - metaDataUpdater is not available in fast mode.
deepmergeFastUnsafeCustom({ metaDataUpdater: () => undefined });

// @ts-expect-error - unknown options are rejected.
deepmergeFastUnsafeCustom({ mergeX: () => undefined });
