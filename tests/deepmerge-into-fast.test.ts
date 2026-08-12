import { describe, expect, it } from "vitest";

import { deepmergeIntoFastUnsafe, deepmergeIntoFastUnsafeCustom } from "../src/index.ts";

describe("deepmergeIntoFastUnsafe", () => {
  it("merges records into target", () => {
    const target = { foo: 1, bar: { baz: 2 } };
    const source = { qux: 3, bar: { quux: 4 } };
    deepmergeIntoFastUnsafe(target, source);

    expect(target).toStrictEqual({
      foo: 1,
      qux: 3,
      bar: { baz: 2, quux: 4 },
    });
  });

  it("merges arrays into target", () => {
    const target = [1, 2];
    const source = [3, 4];
    deepmergeIntoFastUnsafe(target, source);

    expect(target).toStrictEqual([1, 2, 3, 4]);
  });

  it("merges sets into target", () => {
    const target = new Set([1, 2]);
    const source = new Set([2, 3]);
    deepmergeIntoFastUnsafe(target, source);

    expect(target).toStrictEqual(new Set([1, 2, 3]));
  });

  it("merges maps into target", () => {
    const target = new Map<string, unknown>([["key1", { val: 1 }]]);
    const source = new Map<string, unknown>([
      ["key1", { extra: 2 }],
      ["key2", "hello"],
    ]);
    deepmergeIntoFastUnsafe(target, source);

    expect(target.get("key1")).toStrictEqual({ extra: 2 });
    expect(target.get("key2")).toBe("hello");
  });

  it("merges 3 or more objects into target", () => {
    const target = { a: 1, shared: "a" };
    const b = { b: 2, shared: "b" };
    const c = { c: 3, shared: "c" };
    deepmergeIntoFastUnsafe(target, b, c);

    expect(target).toStrictEqual({ a: 1, b: 2, c: 3, shared: "c" });
  });

  it("handles single argument target without mutating it", () => {
    const target = { a: 1 };
    deepmergeIntoFastUnsafe(target);
    expect(target).toStrictEqual({ a: 1 });
  });

  it("merges symbol keys into target", () => {
    const symA = Symbol("a");
    const symB = Symbol("b");
    const target: Record<symbol, number> = { [symA]: 1 };
    const source = { [symB]: 2, [symA]: 3 };
    deepmergeIntoFastUnsafe(target, source);

    expect(target[symA]).toBe(3);
    expect(target[symB]).toBe(2);
  });
});

describe("deepmergeIntoFastUnsafeCustom", () => {
  it("defaults meta to undefined", () => {
    let capturedMeta: unknown = "initial";
    const customMergeInto = deepmergeIntoFastUnsafeCustom({
      mergeOthers: (mut_target, values, utils, meta) => {
        capturedMeta = meta;
        mut_target.value = values.at(-1);
      },
    });

    const target = { a: 1 };
    customMergeInto(target, { a: 2 });
    expect(capturedMeta).toBe(undefined);
  });

  it("supports custom mergeArrays and mergeRecords", () => {
    const customMergeInto = deepmergeIntoFastUnsafeCustom({
      mergeArrays: (mut_target, values) => {
        mut_target.value.push(
          ...values
            .slice(1)
            .flat()
            .map((v) => (typeof v === "number" ? v * 2 : v)),
        );
      },
      mergeRecords: (mut_target, values, utils) => utils.actions.defaultMerge,
    });

    const target = { list: [1, 2] };
    customMergeInto(target, { list: [3, 4] });
    expect(target).toStrictEqual({ list: [1, 2, 6, 8] });
  });

  it("supports custom mergeSets and mergeMaps", () => {
    const customMergeInto = deepmergeIntoFastUnsafeCustom({
      mergeSets: (mut_target, values) => {
        for (const set of values.slice(1)) {
          for (const item of set) {
            mut_target.value.add(String(item));
          }
        }
      },
      mergeMaps: (mut_target, values) => {
        for (const map of values.slice(1)) {
          for (const [k, v] of map) {
            mut_target.value.set(k, v);
          }
        }
      },
    });

    const targetSet = new Set<unknown>([1]);
    const targetMap = new Map<unknown, unknown>([["a", 10]]);

    customMergeInto({ set: targetSet, map: targetMap }, { set: new Set([2]), map: new Map([["b", 20]]) });

    expect(targetSet).toStrictEqual(new Set([1, "2"]));
    expect(targetMap.get("a")).toBe(10);
    expect(targetMap.get("b")).toBe(20);
  });

  it("supports custom filterValues in deepmergeIntoFastUnsafeCustom", () => {
    const customMergeInto = deepmergeIntoFastUnsafeCustom({
      filterValues: (values) => values.filter((v) => v !== null),
    });

    const target = { x: 1 };
    customMergeInto(target, { x: null });
    expect(target).toStrictEqual({ x: 1 });
  });

  it("preserves undefined values when filterValues is false in deepmergeIntoFastUnsafeCustom", () => {
    const customMergeInto = deepmergeIntoFastUnsafeCustom({
      filterValues: false,
    });

    const target = { x: 1 };
    customMergeInto(target, { x: undefined });
    expect(target).toStrictEqual({ x: undefined });
  });

  it("merges 3 or more maps into target with overlapping keys", () => {
    const target = new Map([["k", { a: 1 }]]);
    const b = new Map([["k", { b: 2 }]]);
    const c = new Map([["k", { c: 3 }]]);
    deepmergeIntoFastUnsafe(target, b, c);
    expect(target.get("k")).toStrictEqual({ c: 3 });
  });
});
