import {
  assert,
  assertEquals,
  assertStrictEquals,
} from "https://deno.land/std@0.106.0/testing/asserts.ts";

import { deepmerge } from "../../lib/deno.js";

Deno.test("return undefined when nothing to merge", () => {
  // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
  const merged = deepmerge();
  assertStrictEquals(merged, undefined);
});

Deno.test("return the same object if only 1 is passed", () => {
  const foo = { prop: 1 };
  const merged = deepmerge(foo);
  assertStrictEquals(merged, foo);
});

Deno.test("return the same array if only 1 is passed", () => {
  const foo = [1];
  const merged = deepmerge(foo);
  assertStrictEquals(merged, foo);
});

Deno.test("return the same set if only 1 is passed", () => {
  const foo = new Set([1]);
  const merged = deepmerge(foo);
  assertStrictEquals(merged, foo);
});

Deno.test("return the same map if only 1 is passed", () => {
  const foo = new Map([[1, 2]]);
  const merged = deepmerge(foo);
  assertStrictEquals(merged, foo);
});

Deno.test("return the same date if only 1 is passed", () => {
  const foo = new Date();
  const merged = deepmerge(foo);
  assertStrictEquals(merged, foo);
});

Deno.test("can merge 2 objects with different props", () => {
  const x = { first: true };
  const y = { second: false };

  const expected = {
    first: true,
    second: false,
  };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});

Deno.test("can merge many objects with different props", () => {
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

  assertEquals(merged, expected);
});

Deno.test("can merge with same props", () => {
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

  assertEquals(merged, expected);
});

Deno.test("does not clone any elements", () => {
  const x = { a: { d: 123 } };
  const y = { b: { e: true } };
  const z = { c: { f: "string" } };

  const merged = deepmerge(x, y, z);

  assertStrictEquals(merged.a, x.a);
  assertStrictEquals(merged.b, y.b);
  assertStrictEquals(merged.c, z.c);
});

Deno.test("does not mutate inputs", () => {
  const x = { a: { d: 123 } };
  const y = { b: { e: true } };
  const z = { c: { f: "string" } };

  deepmerge(x, y, z);

  assertEquals(x, { a: { d: 123 } });
  assertEquals(y, { b: { e: true } });
  assertEquals(z, { c: { f: "string" } });
});

Deno.test("merging with empty object shallow clones the object", () => {
  const value = { a: { d: 123 } };

  const merged = deepmerge({}, value);

  assertEquals(merged, value);
  assert(merged !== value, "Value should be shallow cloned.");
  assertStrictEquals(merged.a, value.a, "Value should not be deep cloned.");
});

Deno.test(`can merge nested objects`, () => {
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

  assertEquals(x, {
    key1: {
      subkey1: `value1`,
      subkey2: `value2`,
    },
  });
  assertEquals(merged, expected);
});

Deno.test(`replaces simple prop with nested object`, () => {
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

  assertEquals(merged, expected);
});

Deno.test(`should add nested object in target`, () => {
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

  assertEquals(merged, expected);
  assertStrictEquals(merged.b, y.b, "Value should not be deep cloned.");
});

Deno.test(`replaces nested object with simple prop`, () => {
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

  assertEquals(x, {
    key1: {
      subkey1: `subvalue1`,
      subkey2: `subvalue2`,
    },
    key2: `value2`,
  });
  assertEquals(merged, expected);
});

Deno.test(`replaces records with arrays`, () => {
  const x = { key1: { subkey: `one` } };
  const y = { key1: [`subkey`] };

  const expected = { key1: [`subkey`] };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});

Deno.test(`replaces arrays with records`, () => {
  const x = { key1: [`subkey`] };
  const y = { key1: { subkey: `one` } };

  const expected = { key1: { subkey: `one` } };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});

Deno.test(`replaces dates with records`, () => {
  const x = { key1: new Date() };
  const y = { key1: { subkey: `one` } };

  const expected = { key1: { subkey: `one` } };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});

Deno.test(`replaces records with dates`, () => {
  const date = new Date();
  const x = { key1: { subkey: `one` } };
  const y = { key1: date };

  const expected = { key1: date };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});

Deno.test(`replaces null with records`, () => {
  const x = { key1: null };
  const y = { key1: { subkey: `one` } };

  const expected = { key1: { subkey: `one` } };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});

Deno.test(`replaces records with null`, () => {
  const x = { key1: { subkey: `one` } };
  const y = { key1: null };

  const expected = { key1: null };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});

Deno.test(`replaces undefined with records`, () => {
  const x = { key1: undefined };
  const y = { key1: { subkey: `one` } };

  const expected = { key1: { subkey: `one` } };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});

Deno.test(`replaces records with undefined`, () => {
  const x = { key1: { subkey: `one` } };
  const y = { key1: undefined };

  const expected = { key1: undefined };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});

Deno.test(`can merge arrays`, () => {
  const x = [`one`, `two`];
  const y = [`one`, `three`];

  const expected = [`one`, `two`, `one`, `three`];

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
  assert(Array.isArray(merged));
});

Deno.test(`can merge sets`, () => {
  const x = new Set([`one`, `two`]);
  const y = new Set([`one`, `three`]);

  const expected = new Set([`one`, `two`, `three`]);

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
  assert(merged instanceof Set);
});

Deno.test(`can merge maps`, () => {
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

  assertEquals(merged, expected);
  assert(merged instanceof Map);
});

Deno.test(`can merge array props`, () => {
  const x = { a: [`one`, `two`] };
  const y = { a: [`one`, `three`], b: [null] };

  const expected = { a: [`one`, `two`, `one`, `three`], b: [null] };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
  assert(Array.isArray(merged.a));
  assert(Array.isArray(merged.b));
});

Deno.test(`can merge set props`, () => {
  const x = { a: new Set([`one`, `two`]) };
  const y = { a: new Set([`one`, `three`]) };

  const expected = { a: new Set([`one`, `two`, `three`]) };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
  assert(merged.a instanceof Set);
});

Deno.test(`can merge map props`, () => {
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

  assertEquals(merged, expected);
  assert(merged.a instanceof Map);
});

Deno.test(`works with regular expressions`, () => {
  const x = { key1: /abc/u };
  const y = { key1: /efg/u };

  const expected = { key1: /efg/u };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
  assert(merged.key1 instanceof RegExp);
  assert(merged.key1.test(`efg`));
});

Deno.test(`works with dates`, () => {
  const x = { key1: new Date() };
  const y = { key1: new Date() };

  const expected = { key1: y.key1 };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
  assert(merged.key1 instanceof Date);
});

Deno.test(`supports symbols`, () => {
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

  assertEquals(
    Object.getOwnPropertySymbols(merged),
    Object.getOwnPropertySymbols(expected)
  );

  assertEquals(merged[testSymbol1], expected[testSymbol1]);
  assertEquals(merged[testSymbol2], expected[testSymbol2]);
  assertEquals(merged[testSymbol3], expected[testSymbol3]);
});

/* eslint-disable no-proto, @typescript-eslint/naming-convention */
Deno.test(`merging objects with own __proto__`, () => {
  const a = { key1: "value1" };
  const malicious = { __proto__: { key2: "value2" } };

  const merged = deepmerge(a, malicious);

  assert(
    !Object.prototype.hasOwnProperty.call(merged, "__proto__"),
    `non-plain properties should not be merged`
  );
  assert(
    !Object.prototype.hasOwnProperty.call(merged, "key2"),
    `the destination should have an unmodified prototype`
  );
});
/* eslint-enable no-proto, @typescript-eslint/naming-convention */

Deno.test(`merging objects with plain and non-plain properties`, () => {
  const plainSymbolKey = Symbol(`plainSymbolKey`);
  const parent = {
    parentKey: `should be undefined`,
  };

  const x = Object.create(parent);
  x.plainKey = `should be replaced`;
  x[plainSymbolKey] = `should also be replaced`;

  const y = {
    plainKey: `bar`,
    newKey: `baz`,
    [plainSymbolKey]: `qux`,
  };

  const merged = deepmerge(x, y);

  assert(
    !Object.prototype.hasOwnProperty.call(merged, "parentKey"),
    `inherited properties of target should be removed, not merged or ignored`
  );
  assertStrictEquals(
    merged.plainKey,
    `bar`,
    `enumerable own properties of target should be merged`
  );
  assertStrictEquals(merged.newKey, `baz`, `property should be merged`);
  assertStrictEquals(
    merged[plainSymbolKey],
    `qux`,
    `enumerable own symbol properties should be merged`
  );
});

Deno.test(`merging objects with null prototype`, () => {
  const x = Object.create(null);
  x.a = 1;
  x.b = { c: [2] };

  const y = Object.create(null);
  y.b = { c: [3] };
  y.d = 4;

  const expected = {
    a: 1,
    b: {
      c: [2, 3],
    },
    d: 4,
  };

  const merged = deepmerge(x, y);

  assertEquals(merged, expected);
});
