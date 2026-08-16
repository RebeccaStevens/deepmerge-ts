import { describe, expect, it } from "vitest";

import { deepmergeFastUnsafe, deepmergeFastUnsafeCustom } from "../src/index.ts";

import { testSourceMutationAndCopySemantics } from "./deepmerge-semantics.ts";

describe("deepmergeFastUnsafe", () => {
  it("returns undefined when nothing to merge", () => {
    // eslint-disable-next-line ts/no-confusing-void-expression
    const merged = deepmergeFastUnsafe();
    expect(merged).toBe(undefined);
  });

  it("returns the same object when only 1 is passed", () => {
    const foo = { prop: 1 };
    const merged = deepmergeFastUnsafe(foo);
    expect(merged).toBe(foo);
  });

  it("returns the same array when only 1 is passed", () => {
    const foo = [1];
    const merged = deepmergeFastUnsafe(foo);
    expect(merged).toBe(foo);
  });

  it("returns the same set when only 1 is passed", () => {
    const foo = new Set([1]);
    const merged = deepmergeFastUnsafe(foo);
    expect(merged).toBe(foo);
  });

  it("returns the same map when only 1 is passed", () => {
    const foo = new Map([[1, 2]]);
    const merged = deepmergeFastUnsafe(foo);
    expect(merged).toBe(foo);
  });

  it("merges records correctly", () => {
    const a = { foo: 1, bar: { baz: 2 } };
    const b = { qux: 3, bar: { quux: 4 } };
    const expected = { foo: 1, qux: 3, bar: { baz: 2, quux: 4 } };
    const merged = deepmergeFastUnsafe(a, b);
    expect(merged).toStrictEqual(expected);
  });

  it("merges arrays by concatenation", () => {
    const a = [1, 2];
    const b = [3, 4];
    const merged = deepmergeFastUnsafe(a, b);
    expect(merged).toStrictEqual([1, 2, 3, 4]);
  });

  it("merges sets by union", () => {
    const a = new Set([1, 2]);
    const b = new Set([2, 3]);
    const merged = deepmergeFastUnsafe(a, b);
    expect(merged).toStrictEqual(new Set([1, 2, 3]));
  });

  it("merges maps deeply", () => {
    const a = new Map<string, unknown>([["key1", { val: 1 }]]);
    const b = new Map<string, unknown>([
      ["key1", { extra: 2 }],
      ["key2", "hello"],
    ]);
    const merged = deepmergeFastUnsafe(a, b);
    expect(merged.get("key1")).toStrictEqual({ val: 1, extra: 2 });
    expect(merged.get("key2")).toBe("hello");
  });

  it("merges 3 or more objects", () => {
    const a = { a: 1, shared: "a" };
    const b = { b: 2, shared: "b" };
    const c = { c: 3, shared: "c" };
    const merged = deepmergeFastUnsafe(a, b, c);
    expect(merged).toStrictEqual({ a: 1, b: 2, c: 3, shared: "c" });
  });

  it("merges symbol keys correctly", () => {
    const symA = Symbol("a");
    const symB = Symbol("b");
    const obj1 = { [symA]: 1 };
    const obj2 = { [symB]: 2, [symA]: 3 };

    const merged = deepmergeFastUnsafe(obj1, obj2);
    expect(merged[symA]).toBe(3);
    expect(merged[symB]).toBe(2);
  });

  it("merges primitive values by returning the last one", () => {
    expect(deepmergeFastUnsafe(1, 2)).toBe(2);
    expect(deepmergeFastUnsafe("foo", "bar")).toBe("bar");
    expect(deepmergeFastUnsafe(true, false)).toBe(false);
  });

  it("merges Object.create(null) records", () => {
    const a = Object.assign(Object.create(null) as { foo: number }, { foo: 1 });
    const b = Object.assign(Object.create(null) as { bar: number }, { bar: 2 });

    const merged = deepmergeFastUnsafe(a, b);
    expect(merged).toStrictEqual({ foo: 1, bar: 2 });
  });

  it("replaces mismatched types with the last value", () => {
    const a = { foo: 1 };
    const b = [1, 2];
    const merged = deepmergeFastUnsafe(a, b);
    expect(merged).toStrictEqual([1, 2]);
  });

  testSourceMutationAndCopySemantics(deepmergeFastUnsafe);
});

describe("deepmergeFastUnsafeCustom", () => {
  it("defaults meta to undefined", () => {
    let capturedMeta: unknown = "initial";
    const customMerge = deepmergeFastUnsafeCustom({
      mergeOthers: (values, utils, meta) => {
        capturedMeta = meta;
        return values.at(-1);
      },
    });

    customMerge({ a: 1 }, { a: 2 });
    expect(capturedMeta).toBe(undefined);
  });

  it("custom mergeRecords and mergeArrays", () => {
    const customMerge = deepmergeFastUnsafeCustom({
      mergeArrays: (values) => values.flat().map((v) => (typeof v === "number" ? v * 2 : v)),
      mergeRecords: (values, utils) => utils.actions.defaultMerge,
    });

    const result = customMerge({ list: [1, 2] }, { list: [3, 4] });
    expect(result).toStrictEqual({ list: [2, 4, 6, 8] });
  });

  it("skips properties when actions.skip is returned", () => {
    const customMerge = deepmergeFastUnsafeCustom({
      mergeOthers: (values, utils) => {
        if (values.includes("SKIP_ME")) {
          return utils.actions.skip;
        }
        return values.at(-1);
      },
    });

    const a = { kept: 1, removed: "foo" };
    const b = { kept: 2, removed: "SKIP_ME" };
    const result = customMerge(a, b);

    expect(result).toStrictEqual({ kept: 2 });
    expect("removed" in result).toBe(false);
  });

  it("skips Map entries when actions.skip is returned", () => {
    const customMerge = deepmergeFastUnsafeCustom({
      mergeOthers: (values, utils) => {
        if (values.includes("SKIP_MAP_KEY")) {
          return utils.actions.skip;
        }
        return values.at(-1);
      },
    });

    const mapA = new Map([
      ["k1", "hello"],
      ["k2", "foo"],
    ]);
    const mapB = new Map([
      ["k1", "world"],
      ["k2", "SKIP_MAP_KEY"],
    ]);
    const result = customMerge(mapA, mapB);

    expect(result.get("k1")).toBe("world");
    expect(result.has("k2")).toBe(false);
  });

  it("falls back to default merge on actions.defaultMerge in mergeMaps and mergeSets", () => {
    const customMerge = deepmergeFastUnsafeCustom({
      mergeMaps: (values, utils) => utils.actions.defaultMerge,
      mergeSets: (values, utils) => utils.actions.defaultMerge,
    });

    const map1 = new Map([["a", 1]]);
    const map2 = new Map([["b", 2]]);
    const set1 = new Set([1]);
    const set2 = new Set([2]);

    const result = customMerge({ map: map1, set: set1 }, { map: map2, set: set2 });
    expect(result.map.get("a")).toBe(1);
    expect(result.map.get("b")).toBe(2);
    expect(result.set).toStrictEqual(new Set([1, 2]));
  });

  it("supports custom filterValues option", () => {
    const customMerge = deepmergeFastUnsafeCustom({
      filterValues: (values) => values.filter((v) => v !== null),
    });

    const a = { x: 1 };
    const b = { x: null };
    const result = customMerge(a, b);
    expect(result).toStrictEqual({ x: 1 });
  });

  it("preserves undefined values when filterValues is disabled (false)", () => {
    const customMerge = deepmergeFastUnsafeCustom({
      filterValues: false,
    });

    const a = { x: 1 };
    const b = { x: undefined };
    const result = customMerge(a, b);
    expect(result).toStrictEqual({ x: undefined });
  });

  it("supports enableImplicitDefaultMerging", () => {
    const customMerge = deepmergeFastUnsafeCustom({
      enableImplicitDefaultMerging: true,
      mergeOthers: (values) => values.at(-1),
    });

    const a = { nested: { a: 1 } };
    const b = { nested: { b: 2 } };
    const result = customMerge(a, b);
    expect(result).toStrictEqual({ nested: { a: 1, b: 2 } });
  });

  it("supports custom mergeSets and mergeMaps", () => {
    const customMerge = deepmergeFastUnsafeCustom({
      mergeSets: (values) => new Set([...values.flatMap((s) => [...s].map(String))]),
      mergeMaps: (values) => {
        const result = new Map<unknown, unknown>();
        for (const map of values) {
          for (const [k, v] of map) {
            result.set(k, v);
          }
        }
        return result;
      },
    });

    const s1 = new Set([1]);
    const s2 = new Set([2]);
    const m1 = new Map([["k", 10]]);
    const m2 = new Map([["k", 20]]);

    const result = customMerge({ s: s1, m: m1 }, { s: s2, m: m2 });
    expect(result.s).toStrictEqual(new Set(["1", "2"]));
    expect(result.m.get("k")).toBe(20);
  });

  it("merges 3 or more maps deeply with overlapping keys", () => {
    const a = new Map([["k", { x: 1 }]]);
    const b = new Map([["k", { y: 2 }]]);
    const c = new Map([["k", { z: 3 }]]);
    const result = deepmergeFastUnsafe(a, b, c);
    expect(result.get("k")).toStrictEqual({ x: 1, y: 2, z: 3 });
  });

  it("supports actions.skip in fast custom merge for records and maps", () => {
    const customMerge = deepmergeFastUnsafeCustom({
      mergeOthers: (values, utils) => {
        if (values.includes("skip")) {
          return utils.actions.skip;
        }
        return values.at(-1);
      },
    });

    const resultRecord = customMerge({ a: 1, b: "skip" }, { a: 2 });
    expect(resultRecord).toStrictEqual({ a: 2 });

    const resultMap = customMerge(
      new Map<string, unknown>([
        ["a", 1],
        ["b", "skip"],
      ]),
      new Map<string, unknown>([["a", 2]]),
    );
    expect(resultMap.has("b")).toBe(false);
    expect(resultMap.get("a")).toBe(2);
  });

  it("supports defaultMetaDataUpdaterFast in fast mode utils", () => {
    let mut_called = false;
    const customMerge = deepmergeFastUnsafeCustom({
      mergeOthers: (values, utils) => {
        utils.metaDataUpdater(undefined, {
          key: "k",
          parents: values,
          values,
          result: {},
        });
        mut_called = true;
        return values.at(-1);
      },
    });

    customMerge({ a: 1 }, { a: 2 });
    expect(mut_called).toBe(true);
  });

  it("only merges enumerable properties including symbol properties", () => {
    const symNonEnum = Symbol("symNonEnum");
    const symEnum = Symbol("symEnum");

    const mut_x = {};
    const mut_y = {};

    Object.defineProperties(mut_x, {
      a: {
        value: 1,
        enumerable: false,
      },
      b: {
        value: 2,
        enumerable: true,
      },
      [symNonEnum]: {
        value: "hidden",
        enumerable: false,
      },
      [symEnum]: {
        value: "visible",
        enumerable: true,
      },
    });

    Object.defineProperties(mut_y, {
      a: {
        value: 3,
        enumerable: false,
      },
      b: {
        value: 4,
        enumerable: false,
      },
      [symNonEnum]: {
        value: "hidden2",
        enumerable: false,
      },
    });

    const expected = { b: 2, [symEnum]: "visible" };

    const merged = deepmergeFastUnsafe(mut_x, mut_y);

    expect(merged).toStrictEqual(expected);
  });

  describe("invalid options graceful fallbacks", () => {
    it("falls back to default merge functions when invalid values are provided", () => {
      const customMerge = deepmergeFastUnsafeCustom({
        mergeRecords: "invalid",
      } as any);

      expect(customMerge({ a: 1 }, { b: 2 })).toStrictEqual({ a: 1, b: 2 });
    });
  });
});
