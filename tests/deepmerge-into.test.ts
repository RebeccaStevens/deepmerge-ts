import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { deepmergeInto } from "../src/index.ts";

describe("deepmergeInto", () => {
  it("does not modify the target when nothing to merge", () => {
    const target = { prop: 1 };
    deepmergeInto(target);
    expect(target).toStrictEqual({ prop: 1 });
  });

  it("merges 1 object into another with different properties", () => {
    const x = { first: true };
    const y = { second: false };

    const expectedX = {
      first: true,
      second: false,
    };
    const expectedY = { second: false };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expectedX);
    expect(y).toStrictEqual(expectedY);
  });

  it("merges many objects with different properties into target", () => {
    const v = { first: true };
    const x = { second: false };
    const y = { third: 123 };
    const z = { fourth: "abc" };

    const expected = {
      first: true,
      second: false,
      third: 123,
      fourth: "abc",
    };

    deepmergeInto(v, x, y, z);

    expect(v).toStrictEqual(expected);
  });

  it("merges many objects with overlapping properties into target", () => {
    const x = { key1: "value1", key2: "value2" };
    const y = { key1: "changed", key3: "value3" };
    const z = { key3: "changed", key4: "value4" };

    const expected = {
      key1: "changed",
      key2: "value2",
      key3: "changed",
      key4: "value4",
    };

    deepmergeInto(x, y, z);

    expect(x).toStrictEqual(expected);
  });

  it("does not clone unmerged elements", () => {
    const x = { a: { d: 123 } };
    const y = { b: { e: true } };
    const z = { c: { f: "string" } };

    deepmergeInto(x, y, z);

    expect(x.a).toBe(x.a);
    expect(x.b).toBe(y.b);
    expect(x.c).toBe(z.c);
  });

  it("does not mutate non-target inputs", () => {
    const x = { a: { d: 123 } };
    const y = { b: { e: true } };
    const z = { c: { f: "string" } };

    deepmergeInto(x, y, z);

    expect(y).toStrictEqual({ b: { e: true } });
    expect(z).toStrictEqual({ c: { f: "string" } });
  });

  it("shallow clones the object when merging into an empty object", () => {
    const value = { a: { d: 123 } };

    const target = {};
    deepmergeInto<{}, [typeof value]>(target, value);

    expect(target).toStrictEqual(value);
    expect(target, "Value should be shallow cloned.").not.toBe(value);
    expect(target.a, "Value should not be deep cloned.").toBe(value.a);
  });

  it("merges nested objects into target", () => {
    const x = {
      key1: {
        subkey1: `value1`,
        subkey2: `value2`,
      },
    };
    const y = {
      key1: {
        subkey1: `changed`,
        subkey3: `added`,
      },
    };

    const expected = {
      key1: {
        subkey1: `changed`,
        subkey2: `value2`,
        subkey3: `added`,
      },
    };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it("replaces simple property with nested object in target", () => {
    const x = {
      key1: `value1`,
      key2: `value2`,
    };
    const y = {
      key1: {
        subkey1: `subvalue1`,
        subkey2: `subvalue2`,
      },
    };

    const expected = {
      key1: {
        subkey1: `subvalue1`,
        subkey2: `subvalue2`,
      },
      key2: `value2`,
    };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it("adds nested object into target", () => {
    const x = {
      a: {},
    };
    const y = {
      b: {
        c: {},
      },
    };

    const expected = {
      a: {},
      b: {
        c: {},
      },
    };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
    expect(x.b, "Value should not be deep cloned.").toBe(y.b);
  });

  it("replaces nested object with simple property in target", () => {
    const x = {
      key1: {
        subkey1: `subvalue1`,
        subkey2: `subvalue2`,
      },
      key2: `value2`,
    };
    const y = { key1: `value1` };

    const expected = { key1: `value1`, key2: `value2` };

    deepmergeInto(x, y);
    expect(x).toStrictEqual(expected);
  });

  it(`replaces records with arrays`, () => {
    const x = { key1: { subkey: `one` } };
    const y = { key1: [`subkey`] };

    const expected = { key1: [`subkey`] };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it(`replaces arrays with records`, () => {
    const x = { key1: [`subkey`] };
    const y = { key1: { subkey: `one` } };

    const expected = { key1: { subkey: `one` } };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it(`replaces dates with records`, () => {
    const x = { key1: new Date() };
    const y = { key1: { subkey: `one` } };

    const expected = { key1: { subkey: `one` } };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it(`replaces records with dates`, () => {
    const date = new Date();
    const x = { key1: { subkey: `one` } };
    const y = { key1: date };

    const expected = { key1: date };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it(`replaces null with records`, () => {
    const x = { key1: null };
    const y = { key1: { subkey: `one` } };

    const expected = { key1: { subkey: `one` } };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it(`replaces records with null`, () => {
    const x = { key1: { subkey: `one` } };
    const y = { key1: null };

    const expected = { key1: null };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it(`replaces undefined with records`, () => {
    const x = { key1: undefined };
    const y = { key1: { subkey: `one` } };

    const expected = { key1: { subkey: `one` } };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it("does not replace records with undefined in target", () => {
    const x = { key1: { subkey: `one` } };
    const y = { key1: undefined };

    const expected = { key1: x.key1 };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
  });

  it("does not let undefined values interfere with merging into target", () => {
    const x = { key1: { subkey1: `one` } };
    const y = { key1: undefined };
    const z = { key1: { subkey2: `two` } };

    const expected = { key1: { subkey1: `one`, subkey2: `two` } };

    deepmergeInto(x, y, z);

    expect(x).toStrictEqual(expected);
  });

  it("merges arrays by concatenation into target", () => {
    const x = [`one`, `two`];
    const y = [`one`, `three`];

    const expected = [`one`, `two`, `one`, `three`];

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
    expect(x).toBeInstanceOf(Array);
  });

  it("merges sets by union into target", () => {
    const x = new Set([`one`, `two`]);
    const y = new Set([`one`, `three`]);

    const expected = new Set([`one`, `two`, `three`]);

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
    expect(x).toBeInstanceOf(Set);
  });

  it("merges maps by key into target", () => {
    const x = new Map([
      ["key1", "value1"],
      ["key2", "value2"],
    ]);
    const y = new Map([
      ["key1", "changed"],
      ["key3", "value3"],
    ]);

    const expected = new Map([
      ["key1", "changed"],
      ["key2", "value2"],
      ["key3", "value3"],
    ]);

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
    expect(x instanceof Map).toBe(true);
  });

  it("merges array properties into target", () => {
    const x = { a: [`one`, `two`] };
    const y = { a: [`one`, `three`], b: [null] };

    const expected = { a: [`one`, `two`, `one`, `three`], b: [null] };

    deepmergeInto<typeof x, [typeof y]>(x, y);

    expect(x).toStrictEqual(expected);
    expect(x.a).toBeInstanceOf(Array);
    expect(x.b).toBeInstanceOf(Array);
  });

  it("merges set properties into target", () => {
    const x = { a: new Set([`one`, `two`]) };
    const y = { a: new Set([`one`, `three`]) };

    const expected = { a: new Set([`one`, `two`, `three`]) };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
    expect(x.a).toBeInstanceOf(Set);
  });

  it("merges map properties into target", () => {
    const x = {
      a: new Map([
        ["key1", "value1"],
        ["key2", "value2"],
      ]),
    };
    const y = {
      a: new Map([
        ["key1", "changed"],
        ["key3", "value3"],
      ]),
    };

    const expected = {
      a: new Map([
        ["key1", "changed"],
        ["key2", "value2"],
        ["key3", "value3"],
      ]),
    };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
    expect(x.a).toBeInstanceOf(Map);
  });

  it("replaces regular expressions as leaf values in target", () => {
    const x = { key1: /abc/u };
    const y = { key1: /efg/u };

    const expected = { key1: /efg/u };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
    expect(x.key1).toBeInstanceOf(RegExp);

    // eslint-disable-next-line ts/prefer-includes
    expect(x.key1.test(`efg`)).toBe(true);
  });

  it("replaces dates as leaf values in target", () => {
    const x = { key1: new Date() };
    const y = { key1: new Date() };

    const expected = { key1: y.key1 };

    deepmergeInto(x, y);

    expect(x).toStrictEqual(expected);
    expect(x.key1).toBeInstanceOf(Date);
  });

  it("merges objects with symbol keys into target", () => {
    const testSymbol1 = Symbol("test symbol 1");
    const testSymbol2 = Symbol("test symbol 2");
    const testSymbol3 = Symbol("test symbol 3");

    const x = { [testSymbol1]: `value1`, [testSymbol2]: `value2` };
    const y = { [testSymbol1]: `changed`, [testSymbol3]: `value3` };

    const expected = {
      [testSymbol1]: `changed`,
      [testSymbol2]: `value2`,
      [testSymbol3]: `value3`,
    };

    deepmergeInto(x, y);

    expect(Object.getOwnPropertySymbols(x)).toStrictEqual(Object.getOwnPropertySymbols(expected));

    expect(x[testSymbol1]).toStrictEqual(expected[testSymbol1]);
    expect(x[testSymbol2]).toStrictEqual(expected[testSymbol2]);
    expect(x[testSymbol3]).toStrictEqual(expected[testSymbol3]);
  });

  it("preserves key insertion order when merging 2 records into target", () => {
    const x = { a: 1, b: 2, c: 3 };
    const y = { b: 4, d: 5, e: 6 };

    deepmergeInto(x, y);

    expect(Object.keys(x)).toStrictEqual(["a", "b", "c", "d", "e"]);
    expect(x).toStrictEqual({ a: 1, b: 4, c: 3, d: 5, e: 6 });
  });

  it("merges 2 records into target identically to the general merge path", () => {
    const testSymbol = Symbol("test symbol");
    const x1 = { a: 1, b: { c: [1, 2], d: 3 }, [testSymbol]: `value1` };
    const y1 = { a: 2, b: { c: [3] }, e: `value2` };
    const x2 = { a: 1, b: { c: [1, 2], d: 3 }, [testSymbol]: `value1` };
    const y2 = { a: 2, b: { c: [3] }, e: `value2` };

    const twoRecordTarget = { ...x1 };
    const generalTarget = { ...x2 };

    deepmergeInto(twoRecordTarget, y1);
    deepmergeInto(generalTarget, y2, {});

    expect(twoRecordTarget).toStrictEqual(generalTarget);
    expect(Object.keys(twoRecordTarget)).toStrictEqual(Object.keys(generalTarget));
  });

  it("only merges enumerable properties into target", () => {
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
    });

    const expected = { b: 2 };

    const target = {};
    deepmergeInto(target, mut_x, mut_y);
    expect(target).toStrictEqual(expected);

    expect(() => {
      deepmergeInto(mut_x, mut_y);
    }).toThrow();
  });

  it("merges objects with plain and non-plain properties into target", () => {
    const plainSymbolKey = Symbol(`plainSymbolKey`);
    const parent = {
      parentKey: `should be undefined`,
    };

    const mut_x = Object.create(parent);
    mut_x.plainKey = `should be replaced`;
    mut_x[plainSymbolKey] = `should also be replaced`;

    const y = {
      plainKey: `bar`,
      newKey: `baz`,
      [plainSymbolKey]: `qux`,
    };

    deepmergeInto(mut_x, y);

    expect(
      Object.hasOwn(mut_x, "parentKey"),
      `inherited properties of target should be removed, not merged or ignored`,
    ).toBe(false);
    expect(mut_x.plainKey, `enumerable own properties of target should be merged`).toBe("bar");
    expect(mut_x.newKey, `property should be merged`).toBe("baz");
    expect(mut_x[plainSymbolKey], `enumerable own symbol properties should be merged`).toBe("qux");
  });

  it("merges objects with null prototype into target", () => {
    const mut_x = Object.create(null);
    mut_x.a = 1;
    mut_x.b = { c: [2] };

    const mut_y = Object.create(null);
    mut_y.b = { c: [3] };
    mut_y.d = 4;

    const expected = Object.assign(Object.create(null), {
      a: 1,
      b: {
        c: [2, 3],
      },
      d: 4,
    });

    deepmergeInto(mut_x, mut_y);

    expect(mut_x).toStrictEqual(expected);
  });

  it("correctly identifies valid records", () => {
    const mut_a = { a: 1 };
    // eslint-disable-next-line no-proto, no-restricted-properties
    (mut_a as any).__proto__.aProto = 1;

    const mut_b = Object.create({ bProto: 2 });
    mut_b.b = 2;

    const mut_c = Object.create(Object.prototype);
    mut_c.c = 3;

    const mut_d = Object.create(null);
    mut_d.d = 4;

    const expected = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };

    deepmergeInto(mut_a, mut_b, mut_c, mut_d);

    expect(mut_a).toStrictEqual(expected);
  });

  it("correctly identifies invalid records", () => {
    const a = {};

    // eslint-disable-next-line ts/no-extraneous-class
    class AClass {}
    const mut_b = new AClass();

    (mut_b as any).a = 1;

    const c = {};

    const expected = {};

    deepmergeInto(a, mut_b, c);
    expect(a).toStrictEqual(expected);
  });

  it("merges CommonJS modules into target", () => {
    const require = createRequire(import.meta.url);

    const a = { ...require("./modules/a.cjs") };
    const b = require("./modules/b.cjs");

    const expected = {
      age: 30,
      name: "alice",
    };

    deepmergeInto(a, b);

    expect(a).toStrictEqual(expected);
  });

  it("merges ESM modules into target", async () => {
    const a = { ...(await import("./modules/a.mjs")) };
    const b = await import("./modules/b.mjs");

    const expected = {
      age: 30,
      name: "alice",
    };

    deepmergeInto(a, b);

    expect(a).toStrictEqual(expected);
  });

  it("guards against prototype pollution", () => {
    const payload = '{"__proto__":{"a0":true}}';

    const x: any = JSON.parse(payload);
    const y: any = {};

    deepmergeInto(x, y);

    expect(JSON.stringify(x)).toStrictEqual(payload);

    expect(({} as any).a0, "Safe POJO").not.toBe(true);
    expect(x.a0, "Safe x input").not.toBe(true);
    expect(y.a0, "Safe y input").not.toBe(true);
    expect(x.a0, "Safe output").not.toBe(true);
  });

  it("does not mutate nested array input containers", () => {
    const yArr = [4, 5];
    const x = { items: [1, 2, 3] };
    const y = { items: yArr };

    deepmergeInto(x, y);

    expect(yArr).toStrictEqual([4, 5]);
    expect(x.items).toStrictEqual([1, 2, 3, 4, 5]);
  });

  it("does not mutate nested set input containers", () => {
    const ySet = new Set([4, 5]);
    const x = { tags: new Set([1, 2, 3]) };
    const y = { tags: ySet };

    deepmergeInto(x, y);

    expect(ySet).toStrictEqual(new Set([4, 5]));
    expect(x.tags).toStrictEqual(new Set([1, 2, 3, 4, 5]));
  });

  it("does not mutate nested map input containers", () => {
    const yMap = new Map<string, number>([["b", 2]]);
    const x = { counts: new Map<string, number>([["a", 1]]) };
    const y = { counts: yMap };

    deepmergeInto(x, y);

    expect(yMap).toStrictEqual(new Map([["b", 2]]));
    expect(x.counts).toStrictEqual(
      new Map<string, number>([
        ["a", 1],
        ["b", 2],
      ]),
    );
  });

  it("does not alias-mutate a source's nested array across repeated calls", () => {
    // Regression: deepmergeInto used to alias the first source's nested
    // array into the recursive merge wrapper so that each subsequent call
    // extended it. After many iterations this caused OOM in the runtime
    // benchmark.
    const a = { sub: { items: [1, 2] } };
    const b = { sub: { items: [3, 4] } };

    for (let i = 0; i < 50; i++) {
      deepmergeInto({}, a, b);
    }

    expect(a.sub.items).toStrictEqual([1, 2]);
    expect(b.sub.items).toStrictEqual([3, 4]);
  });

  it("does not alias-mutate a source's nested set or map across repeated calls", () => {
    const aSet = new Set([1]);
    const aMap = new Map<string, number>([["a", 1]]);
    const a = { s: aSet, m: aMap };
    const bSet = new Set([2]);
    const bMap = new Map<string, number>([["b", 2]]);
    const b = { s: bSet, m: bMap };

    for (let i = 0; i < 50; i++) {
      deepmergeInto({}, a, b);
    }

    expect([...aSet]).toStrictEqual([1]);
    expect([...bSet]).toStrictEqual([2]);
    expect([...aMap.entries()]).toStrictEqual([["a", 1]]);
    expect([...bMap.entries()]).toStrictEqual([["b", 2]]);
  });

  it("merges map properties into a fresh target, preserving the first source's entries", () => {
    // Regression: mergeMapsInto skipped the first element of `values` under
    // the assumption that it was the target map, so when the target lacked
    // the key the first source's entries were dropped.
    const a = { m: new Map([["a", 1]]) };
    const b = { m: new Map([["b", 2]]) };

    const target: Record<string, unknown> = {};
    deepmergeInto(target, a, b);

    expect(target["m"]).toStrictEqual(
      new Map([
        ["a", 1],
        ["b", 2],
      ]),
    );
  });

  it("deeply merges map values that are records with nested containers without aliasing sources", () => {
    const a = { m: new Map([["x", { items: [1, 2] }]]) };
    const b = { m: new Map([["x", { items: [3, 4] }]]) };

    const target: Record<string, unknown> = {};
    deepmergeInto(target, a, b);

    expect(target["m"]).toStrictEqual(new Map([["x", { items: [1, 2, 3, 4] }]]));
    expect(a.m.get("x")!.items).toStrictEqual([1, 2]);
    expect(b.m.get("x")!.items).toStrictEqual([3, 4]);
  });

  it("does not alias-mutate a source's map values that contain nested containers across repeated calls", () => {
    // Regression: mergeMapsInto shallow-cloned the first candidate, aliasing
    // the source's nested containers so that repeated calls grew them until
    // the spread in mergeArraysInto blew the call stack.
    const a = { m: new Map([["x", { items: [1, 2] }]]) };
    const b = { m: new Map([["x", { items: [3, 4] }]]) };

    for (let i = 0; i < 50; i++) {
      deepmergeInto({}, a, b);
    }

    expect(a.m.get("x")!.items).toStrictEqual([1, 2]);
    expect(b.m.get("x")!.items).toStrictEqual([3, 4]);
  });
});
