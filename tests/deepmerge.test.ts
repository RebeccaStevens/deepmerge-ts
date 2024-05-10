import { createRequire } from "node:module";

import { describe, expect, it } from "vitest";

import { deepmerge } from "../src";

describe("deepmerge", () => {
  it("return undefined when nothing to merge", () => {
    // eslint-disable-next-line ts/no-confusing-void-expression
    const merged = deepmerge();
    expect(merged).toBe(undefined);
  });

  it("return the same object if only 1 is passed", () => {
    const foo = { prop: 1 };
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("return the same array if only 1 is passed", () => {
    const foo = [1];
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("return the same set if only 1 is passed", () => {
    const foo = new Set([1]);
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("return the same map if only 1 is passed", () => {
    const foo = new Map([[1, 2]]);
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("return the same date if only 1 is passed", () => {
    const foo = new Date();
    const merged = deepmerge(foo);
    expect(merged).toBe(foo);
  });

  it("can merge 2 objects with different props", () => {
    const x = { first: true };
    const y = { second: false };

    const expected = {
      first: true,
      second: false,
    };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("can merge many objects with different props", () => {
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

  it("can merge many objects with same props", () => {
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

  it("does not clone any elements", () => {
    const x = { a: { d: 123 } };
    const y = { b: { e: true } };
    const z = { c: { f: "string" } };

    const merged = deepmerge(x, y, z);

    expect(merged.a).toBe(x.a);
    expect(merged.b).toBe(y.b);
    expect(merged.c).toBe(z.c);
  });

  it("does not mutate inputs", () => {
    const x = { a: { d: 123 } };
    const y = { b: { e: true } };
    const z = { c: { f: "string" } };

    deepmerge(x, y, z);

    expect(x).toStrictEqual({ a: { d: 123 } });
    expect(y).toStrictEqual({ b: { e: true } });
    expect(z).toStrictEqual({ c: { f: "string" } });
  });

  it("merging with empty object shallow clones the object", () => {
    const value = { a: { d: 123 } };

    const merged = deepmerge({}, value);

    expect(merged).toStrictEqual(value);
    expect(merged, "Value should be shallow cloned.").not.toBe(value);
    expect(merged.a, "Value should not be deep cloned.").toBe(value.a);
  });

  it(`can merge nested objects`, () => {
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

  it(`replaces simple prop with nested object`, () => {
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

  it(`should add nested object in target`, () => {
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

  it(`replaces nested object with simple prop`, () => {
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

    const expected = { key1: { subkey: `one` } };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it(`replaces records with undefined`, () => {
    const x = { key1: { subkey: `one` } };
    const y = { key1: undefined };

    const expected = { key1: undefined };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it(`can merge arrays`, () => {
    const x = [`one`, `two`];
    const y = [`one`, `three`];

    const expected = [`one`, `two`, `one`, `three`];

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged).toBeInstanceOf(Array);
  });

  it(`can merge sets`, () => {
    const x = new Set([`one`, `two`]);
    const y = new Set([`one`, `three`]);

    const expected = new Set([`one`, `two`, `three`]);

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged).toBeInstanceOf(Set);
  });

  it(`can merge maps`, () => {
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

  it(`can merge array props`, () => {
    const x = { a: [`one`, `two`] };
    const y = { a: [`one`, `three`], b: [null] };

    const expected = { a: [`one`, `two`, `one`, `three`], b: [null] };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.a).toBeInstanceOf(Array);
    expect(merged.b).toBeInstanceOf(Array);
  });

  it(`can merge set props`, () => {
    const x = { a: new Set([`one`, `two`]) };
    const y = { a: new Set([`one`, `three`]) };

    const expected = { a: new Set([`one`, `two`, `three`]) };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.a).toBeInstanceOf(Set);
  });

  it(`can merge map props`, () => {
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

  it(`works with regular expressions`, () => {
    const x = { key1: /abc/u };
    const y = { key1: /efg/u };

    const expected = { key1: /efg/u };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.key1).toBeInstanceOf(RegExp);
    expect(merged.key1.test("efg")).toBe(true);
  });

  it(`works with dates`, () => {
    const x = { key1: new Date() };
    const y = { key1: new Date() };

    const expected = { key1: y.key1 };

    const merged = deepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.key1).toBeInstanceOf(Date);
  });

  it(`supports symbols`, () => {
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

    expect(Object.getOwnPropertySymbols(merged)).toStrictEqual(
      Object.getOwnPropertySymbols(expected),
    );

    expect(merged[testSymbol1]).toStrictEqual(expected[testSymbol1]);
    expect(merged[testSymbol2]).toStrictEqual(expected[testSymbol2]);
    expect(merged[testSymbol3]).toStrictEqual(expected[testSymbol3]);
  });

  it("enumerable keys", () => {
    const m_x = {};
    const m_y = {};

    Object.defineProperties(m_x, {
      a: {
        value: 1,
        enumerable: false,
      },
      b: {
        value: 2,
        enumerable: true,
      },
    });

    Object.defineProperties(m_y, {
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

    const merged = deepmerge(m_x, m_y);

    expect(merged).toStrictEqual(expected);
  });

  it(`merging objects with plain and non-plain properties`, () => {
    const plainSymbolKey = Symbol(`plainSymbolKey`);
    const parent = {
      parentKey: `should be undefined`,
    };

    const m_x = Object.create(parent);
    m_x.plainKey = `should be replaced`;
    m_x[plainSymbolKey] = `should also be replaced`;

    const y = {
      plainKey: `bar`,
      newKey: `baz`,
      [plainSymbolKey]: `qux`,
    };

    const merged = deepmerge(m_x, y);

    expect(
      Object.hasOwn(merged, "parentKey"),
      `inherited properties of target should be removed, not merged or ignored`,
    ).toBe(false);
    expect(
      merged.plainKey,
      `enumerable own properties of target should be merged`,
    ).toBe("bar");
    expect(merged.newKey, `property should be merged`).toBe("baz");
    expect(
      merged[plainSymbolKey],
      `enumerable own symbol properties should be merged`,
    ).toBe("qux");
  });

  it(`merging objects with null prototype`, () => {
    const m_x = Object.create(null);
    m_x.a = 1;
    m_x.b = { c: [2] };

    const m_y = Object.create(null);
    m_y.b = { c: [3] };
    m_y.d = 4;

    const expected = {
      a: 1,
      b: {
        c: [2, 3],
      },
      d: 4,
    };

    const merged = deepmerge(m_x, m_y);

    expect(merged).toStrictEqual(expected);
  });

  it("detecting valid records", () => {
    const m_a = { a: 1 };
    // eslint-disable-next-line no-proto, no-restricted-properties
    (m_a as any).__proto__.aProto = 1;

    const m_b = Object.create({ bProto: 2 });
    m_b.b = 2;

    const m_c = Object.create(Object.prototype);
    m_c.c = 3;

    const m_d = Object.create(null);
    m_d.d = 4;

    const expected = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
    };

    const merged = deepmerge(m_a, m_b, m_c, m_d);

    expect(merged).toStrictEqual(expected);
  });

  it("detecting invalid records", () => {
    const expected = {};

    // eslint-disable-next-line ts/no-extraneous-class
    class AClass {}
    const m_a = new AClass();

    (m_a as any).a = 1;

    expect(deepmerge(m_a, expected)).toStrictEqual(expected);
  });

  it("merging cjs modules", () => {
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

  it("merging esm modules", async () => {
    const a = await import("./modules/a.mjs");
    const b = await import("./modules/b.mjs");

    const expected = {
      age: 30,
      name: "alice",
    };

    const merged = deepmerge(a, b);

    expect(merged).toStrictEqual(expected);
  });

  it("prototype pollution", () => {
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
});
