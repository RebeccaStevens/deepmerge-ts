import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { deepmerge } from "../src/index.ts";

import { testSourceMutationAndCopySemantics } from "./deepmerge-semantics.ts";

describe("deepmerge", () => {
  it("returns undefined when nothing to merge", () => {
    // eslint-disable-next-line ts/no-confusing-void-expression
    const merged = deepmerge();
    expect(merged).toBeUndefined();
  });

  it("returns the same object when only 1 is passed", () => {
    const foo = { prop: 1 };
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("returns the same array when only 1 is passed", () => {
    const foo = [1];
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("returns the same set when only 1 is passed", () => {
    const foo = new Set([1]);
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("returns the same map when only 1 is passed", () => {
    const foo = new Map([[1, 2]]);
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("returns the same date when only 1 is passed", () => {
    const foo = new Date();
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("merges 2 objects with different properties", () => {
    const x = { first: true };
    const y = { second: false };

    const expected = {
      first: true,
      second: false,
    };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("merges many objects with different properties", () => {
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

    const merged = deepmerge(v, x, y, z);

    expect(merged).toStrictEqual(expected);
  });

  it("merges many objects with overlapping properties", () => {
    const x = { key1: "value1", key2: "value2" };
    const y = { key1: "changed", key3: "value3" };
    const z = { key3: "changed", key4: "value4" };

    const expected = {
      key1: "changed",
      key2: "value2",
      key3: "changed",
      key4: "value4",
    };

    const merged = deepmerge(x, y, z);

    expect(merged).toStrictEqual(expected);
  });

  it("does not clone unmerged elements", () => {
    const x = { a: { d: 123 } };
    const y = { b: { e: true } };
    const z = { c: { f: "string" } };

    const merged = deepmerge(x, y, z);

    expect(merged.a).toBe(x.a);
    expect(merged.b).toBe(y.b);
    expect(merged.c).toBe(z.c);
  });

  it("does not mutate input objects", () => {
    const x = { a: { d: 123 } };
    const y = { b: { e: true } };
    const z = { c: { f: "string" } };

    deepmerge(x, y, z);

    expect(x).toStrictEqual({ a: { d: 123 } });
    expect(y).toStrictEqual({ b: { e: true } });
    expect(z).toStrictEqual({ c: { f: "string" } });
  });

  it("shallow clones the object when merging with an empty object", () => {
    const value = { a: { d: 123 } };

    const merged = deepmerge({}, value);

    expect(merged).toStrictEqual(value);
    expect(merged, "Value should be shallow cloned.").not.toBe(value);
    expect(merged.a, "Value should not be deep cloned.").toBe(value.a);
  });

  it("merges nested objects", () => {
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

    const merged = deepmerge(x, y);

    expect(x).toStrictEqual({
      key1: {
        subkey1: `value1`,
        subkey2: `value2`,
      },
    });
    expect(merged).toStrictEqual(expected);
  });

  it("replaces simple property with nested object", () => {
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

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("adds nested object in target", () => {
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

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.b, "Value should not be deep cloned.").toBe(y.b);
  });

  it("replaces nested object with simple property", () => {
    const x = {
      key1: {
        subkey1: `subvalue1`,
        subkey2: `subvalue2`,
      },
      key2: `value2`,
    };
    const y = { key1: `value1` };

    const expected = { key1: `value1`, key2: `value2` };

    const merged = deepmerge(x, y);

    expect(x).toStrictEqual({
      key1: {
        subkey1: `subvalue1`,
        subkey2: `subvalue2`,
      },
      key2: `value2`,
    });
    expect(merged).toStrictEqual(expected);
  });

  it(`replaces records with arrays`, () => {
    const x = { key1: { subkey: `one` } };
    const y = { key1: [`subkey`] };

    const expected = { key1: [`subkey`] };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it(`replaces arrays with records`, () => {
    const x = { key1: [`subkey`] };
    const y = { key1: { subkey: `one` } };

    const expected = { key1: { subkey: `one` } };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it(`replaces dates with records`, () => {
    const x = { key1: new Date() };
    const y = { key1: { subkey: `one` } };

    const expected = { key1: { subkey: `one` } };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it(`replaces records with dates`, () => {
    const date = new Date();
    const x = { key1: { subkey: `one` } };
    const y = { key1: date };

    const expected = { key1: date };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it(`replaces null with records`, () => {
    const x = { key1: null };
    const y = { key1: { subkey: `one` } };

    const expected = { key1: { subkey: `one` } };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it(`replaces records with null`, () => {
    const x = { key1: { subkey: `one` } };
    const y = { key1: null };

    const expected = { key1: null };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it(`replaces undefined with records`, () => {
    const x = { key1: undefined };
    const y = { key1: { subkey: `one` } };

    const expected = { key1: y.key1 };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("does not replace records with undefined", () => {
    const x = { key1: { subkey: `one` } };
    const y = { key1: undefined };

    const expected = { key1: x.key1 };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("does not let undefined values interfere with merging", () => {
    const x = { key1: { subkey1: `one` } };
    const y = { key1: undefined };
    const z = { key1: { subkey2: `two` } };

    const expected = { key1: { subkey1: `one`, subkey2: `two` } };

    const merged = deepmerge(x, y, z);

    expect(merged).toStrictEqual(expected);
  });

  it("merges arrays by concatenation", () => {
    const x = [`one`, `two`];
    const y = [`one`, `three`];

    const expected = [`one`, `two`, `one`, `three`];

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged).toBeInstanceOf(Array);
  });

  it("merges sets by union", () => {
    const x = new Set([`one`, `two`]);
    const y = new Set([`one`, `three`]);

    const expected = new Set([`one`, `two`, `three`]);

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged).toBeInstanceOf(Set);
  });

  it("merges maps by key", () => {
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

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged).toBeInstanceOf(Map);
  });

  it("merges array properties", () => {
    const x = { a: [`one`, `two`] };
    const y = { a: [`one`, `three`], b: [null] };

    const expected = { a: [`one`, `two`, `one`, `three`], b: [null] };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.a).toBeInstanceOf(Array);
    expect(merged.b).toBeInstanceOf(Array);
  });

  it("merges set properties", () => {
    const x = { a: new Set([`one`, `two`]) };
    const y = { a: new Set([`one`, `three`]) };

    const expected = { a: new Set([`one`, `two`, `three`]) };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.a).toBeInstanceOf(Set);
  });

  it("merges map properties", () => {
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

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.a).toBeInstanceOf(Map);
  });

  it("replaces regular expressions as leaf values", () => {
    const x = { key1: /abc/u };
    const y = { key1: /efg/u };

    const expected = { key1: /efg/u };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.key1).toBeInstanceOf(RegExp);
    expect(merged.key1.test("efg")).toBe(true);
  });

  it("replaces dates as leaf values", () => {
    const x = { key1: new Date() };
    const y = { key1: new Date() };

    const expected = { key1: y.key1 };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.key1).toBeInstanceOf(Date);
  });

  it("merges objects with symbol keys", () => {
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

    const merged = deepmerge(x, y);

    expect(Object.getOwnPropertySymbols(merged)).toStrictEqual(Object.getOwnPropertySymbols(expected));

    expect(merged[testSymbol1]).toStrictEqual(expected[testSymbol1]);
    expect(merged[testSymbol2]).toStrictEqual(expected[testSymbol2]);
    expect(merged[testSymbol3]).toStrictEqual(expected[testSymbol3]);
  });

  it("preserves key insertion order when merging 2 records", () => {
    const x = { a: 1, b: 2, c: 3 };
    const y = { b: 4, d: 5, e: 6 };

    const merged = deepmerge(x, y);

    expect(Object.keys(merged)).toStrictEqual(["a", "b", "c", "d", "e"]);
    expect(merged).toStrictEqual({ a: 1, b: 4, c: 3, d: 5, e: 6 });
  });

  it("merges 2 records identically to the general merge path", () => {
    const testSymbol = Symbol("test symbol");
    const x = { a: 1, b: { c: [1, 2], d: 3 }, [testSymbol]: `value1` };
    const y = { a: 2, b: { c: [3] }, e: `value2` };

    const twoRecordMerge = deepmerge(x, y);
    const generalMerge = deepmerge(x, y, {});

    expect(twoRecordMerge).toStrictEqual(generalMerge);
    expect(Object.keys(twoRecordMerge)).toStrictEqual(Object.keys(generalMerge));
  });

  it("only merges enumerable properties", () => {
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

    const merged = deepmerge(mut_x, mut_y);

    expect(merged).toStrictEqual(expected);
  });

  it("merges objects with plain and non-plain properties", () => {
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

    const merged = deepmerge(mut_x, y);

    expect(
      Object.hasOwn(merged, "parentKey"),
      `inherited properties of target should be removed, not merged or ignored`,
    ).toBe(false);
    expect(merged.plainKey, `enumerable own properties of target should be merged`).toBe("bar");
    expect(merged.newKey, `property should be merged`).toBe("baz");
    expect(merged[plainSymbolKey], `enumerable own symbol properties should be merged`).toBe("qux");
  });

  it("merges objects with null prototype", () => {
    const mut_x = Object.create(null);
    mut_x.a = 1;
    mut_x.b = { c: [2] };

    const mut_y = Object.create(null);
    mut_y.b = { c: [3] };
    mut_y.d = 4;

    const expected = {
      a: 1,
      b: {
        c: [2, 3],
      },
      d: 4,
    };

    const merged = deepmerge(mut_x, mut_y);

    expect(merged).toStrictEqual(expected);
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

    const merged = deepmerge(mut_a, mut_b, mut_c, mut_d);

    expect(merged).toStrictEqual(expected);
  });

  it("correctly identifies invalid records", () => {
    const expected = {};

    // eslint-disable-next-line ts/no-extraneous-class
    class AClass {}
    const mut_a = new AClass();

    (mut_a as any).a = 1;

    expect(deepmerge(mut_a, expected)).toStrictEqual(expected);
  });

  it("merges CommonJS modules", () => {
    const require = createRequire(import.meta.url);

    const a = require("./modules/a.cjs");
    const b = require("./modules/b.cjs");

    const expected = {
      age: 30,
      name: "alice",
    };

    const merged = deepmerge(a, b);

    expect(merged).toStrictEqual(expected);
  });

  it("merges ESM modules", async () => {
    const a = await import("./modules/a.mjs");
    const b = await import("./modules/b.mjs");

    const expected = {
      age: 30,
      name: "alice",
    };

    const merged = deepmerge(a, b);

    expect(merged).toStrictEqual(expected);
  });

  it("guards against prototype pollution", () => {
    const payload = '{"__proto__":{"a0":true}}';

    const x: any = JSON.parse(payload);
    const y: any = {};

    const merged: any = deepmerge(x, y);

    expect(JSON.stringify(merged)).toStrictEqual(payload);

    expect(({} as any).a0, "Safe POJO").not.toBe(true);
    expect(x.a0, "Safe x input").not.toBe(true);
    expect(y.a0, "Safe y input").not.toBe(true);
    expect(merged.a0, "Safe output").not.toBe(true);
  });

  it("merges Object.create(null) objects", () => {
    const a = Object.assign(Object.create(null) as { foo: number }, { foo: 1 });
    const b = Object.assign(Object.create(null) as { bar: number }, { bar: 2 });

    const merged = deepmerge(a, b);
    expect(merged).toStrictEqual({ foo: 1, bar: 2 });
  });

  testSourceMutationAndCopySemantics(deepmerge);
});
