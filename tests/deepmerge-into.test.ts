import { createRequire } from "node:module";

import test from "ava";

import { deepmergeInto } from "deepmerge-ts";

test("does not modify the target when nothing to merge", (t) => {
  const target = { prop: 1 };
  deepmergeInto(target);
  t.deepEqual(target, { prop: 1 });
});

test("can merge 1 object into another with different props", (t) => {
  const x = { first: true };
  const y = { second: false };

  const expectedX = {
    first: true,
    second: false,
  };
  const expectedY = { second: false };

  deepmergeInto(x, y);

  t.deepEqual(x, expectedX);
  t.deepEqual(y, expectedY);
});

test("can merge many objects with different props", (t) => {
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

  t.deepEqual(v, expected);
});

test("can merge many objects with same props", (t) => {
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

  t.deepEqual(x, expected);
});

test("does not clone any elements", (t) => {
  const x = { a: { d: 123 } };
  const y = { b: { e: true } };
  const z = { c: { f: "string" } };

  deepmergeInto(x, y, z);

  t.is(x.a, x.a);
  t.is(x.b, y.b);
  t.is(x.c, z.c);
});

test("does not mutate non-target inputs", (t) => {
  const x = { a: { d: 123 } };
  const y = { b: { e: true } };
  const z = { c: { f: "string" } };

  deepmergeInto(x, y, z);

  t.deepEqual(y, { b: { e: true } });
  t.deepEqual(z, { c: { f: "string" } });
});

test("merging with empty object shallow clones the object", (t) => {
  const value = { a: { d: 123 } };

  const target = {};
  deepmergeInto<{}, [typeof value]>(target, value);

  t.deepEqual(target, value);
  t.not(target, value, "Value should be shallow cloned.");
  t.is(target.a, value.a, "Value should not be deep cloned.");
});

test(`can merge nested objects`, (t) => {
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

  t.deepEqual(x, expected);
});

test(`replaces simple prop with nested object`, (t) => {
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

  t.deepEqual(x, expected);
});

test(`should add nested object in target`, (t) => {
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

  t.deepEqual(x, expected);
  t.is(x.b, y.b, "Value should not be deep cloned.");
});

test(`replaces nested object with simple prop`, (t) => {
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
  t.deepEqual(x, expected);
});

test(`replaces records with arrays`, (t) => {
  const x = { key1: { subkey: `one` } };
  const y = { key1: [`subkey`] };

  const expected = { key1: [`subkey`] };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
});

test(`replaces arrays with records`, (t) => {
  const x = { key1: [`subkey`] };
  const y = { key1: { subkey: `one` } };

  const expected = { key1: { subkey: `one` } };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
});

test(`replaces dates with records`, (t) => {
  const x = { key1: new Date() };
  const y = { key1: { subkey: `one` } };

  const expected = { key1: { subkey: `one` } };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
});

test(`replaces records with dates`, (t) => {
  const date = new Date();
  const x = { key1: { subkey: `one` } };
  const y = { key1: date };

  const expected = { key1: date };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
});

test(`replaces null with records`, (t) => {
  const x = { key1: null };
  const y = { key1: { subkey: `one` } };

  const expected = { key1: { subkey: `one` } };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
});

test(`replaces records with null`, (t) => {
  const x = { key1: { subkey: `one` } };
  const y = { key1: null };

  const expected = { key1: null };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
});

test(`replaces undefined with records`, (t) => {
  const x = { key1: undefined };
  const y = { key1: { subkey: `one` } };

  const expected = { key1: { subkey: `one` } };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
});

test(`replaces records with undefined`, (t) => {
  const x = { key1: { subkey: `one` } };
  const y = { key1: undefined };

  const expected = { key1: undefined };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
});

test(`can merge arrays`, (t) => {
  const x = [`one`, `two`];
  const y = [`one`, `three`];

  const expected = [`one`, `two`, `one`, `three`];

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
  t.true(Array.isArray(x));
});

test(`can merge sets`, (t) => {
  const x = new Set([`one`, `two`]);
  const y = new Set([`one`, `three`]);

  const expected = new Set([`one`, `two`, `three`]);

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
  t.true(x instanceof Set);
});

test(`can merge maps`, (t) => {
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

  t.deepEqual(x, expected);
  t.true(x instanceof Map);
});

test(`can merge array props`, (t) => {
  const x = { a: [`one`, `two`] };
  const y = { a: [`one`, `three`], b: [null] };

  const expected = { a: [`one`, `two`, `one`, `three`], b: [null] };

  deepmergeInto<typeof x, [typeof y]>(x, y);

  t.deepEqual(x, expected);
  t.true(Array.isArray(x.a));
  t.true(Array.isArray(x.b));
});

test(`can merge set props`, (t) => {
  const x = { a: new Set([`one`, `two`]) };
  const y = { a: new Set([`one`, `three`]) };

  const expected = { a: new Set([`one`, `two`, `three`]) };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
  t.true(x.a instanceof Set);
});

test(`can merge map props`, (t) => {
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

  t.deepEqual(x, expected);
  t.true(x.a instanceof Map);
});

test(`works with regular expressions`, (t) => {
  const x = { key1: /abc/u };
  const y = { key1: /efg/u };

  const expected = { key1: /efg/u };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
  t.true(x.key1 instanceof RegExp);
  // eslint-disable-next-line @typescript-eslint/prefer-includes
  t.true(x.key1.test(`efg`));
});

test(`works with dates`, (t) => {
  const x = { key1: new Date() };
  const y = { key1: new Date() };

  const expected = { key1: y.key1 };

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
  t.true(x.key1 instanceof Date);
});

test(`supports symbols`, (t) => {
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

  t.deepEqual(
    Object.getOwnPropertySymbols(x),
    Object.getOwnPropertySymbols(expected)
  );

  t.deepEqual(x[testSymbol1], expected[testSymbol1]);
  t.deepEqual(x[testSymbol2], expected[testSymbol2]);
  t.deepEqual(x[testSymbol3], expected[testSymbol3]);
});

test("enumerable keys", (t) => {
  const x = {};
  const y = {};

  Object.defineProperties(x, {
    a: {
      value: 1,
      enumerable: false,
    },
    b: {
      value: 2,
      enumerable: true,
    },
  });

  Object.defineProperties(y, {
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
  deepmergeInto(target, x, y);
  t.deepEqual(x, expected);

  t.throws(() => {
    deepmergeInto(x, y);
  });
});

test(`merging objects with plain and non-plain properties`, (t) => {
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

  deepmergeInto(x, y);

  t.false(
    Object.hasOwn(x, "parentKey"),
    `inherited properties of target should be removed, not target or ignored`
  );
  t.is(
    x.plainKey,
    `bar`,
    `enumerable own properties of target should be target`
  );
  t.is(x.newKey, `baz`, `property should be target`);
  t.is(
    x[plainSymbolKey],
    `qux`,
    `enumerable own symbol properties should be target`
  );
});

test(`merging objects with null prototype`, (t) => {
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

  deepmergeInto(x, y);

  t.deepEqual(x, expected);
});

test("dectecting valid records", (t) => {
  const a = { a: 1 };
  // eslint-disable-next-line no-proto, @typescript-eslint/no-explicit-any
  (a as any).__proto__.aProto = 1;

  const b = Object.create({ bProto: 2 });
  b.b = 2;

  const c = Object.create(Object.prototype);
  c.c = 3;

  const d = Object.create(null);
  d.d = 4;

  const expected = {
    a: 1,
    b: 2,
    c: 3,
    d: 4,
  };

  deepmergeInto(a, b, c, d);

  t.deepEqual(a, expected);
});

test("dectecting invalid records", (t) => {
  const a = {};

  class AClass {}
  const b = new AClass();
  (b as any).a = 1;

  const c = {};

  const expected = {};

  deepmergeInto(a, b, c);
  t.deepEqual(a, expected);
});

test("merging cjs modules", (t) => {
  const require = createRequire(import.meta.url);

  /* eslint-disable @typescript-eslint/no-var-requires, unicorn/prefer-module */
  const a = require("./modules/a.cjs");
  const b = require("./modules/b.cjs");
  /* eslint-enable @typescript-eslint/no-var-requires, unicorn/prefer-module */

  const expected = {
    age: 30,
    name: "alice",
  };

  deepmergeInto(a, b);

  t.deepEqual(a, expected);
});

test("merging esm modules", async (t) => {
  const a = await import("./modules/a.mjs");
  const b = await import("./modules/b.mjs");

  const expected = {
    age: 30,
    name: "alice",
  };

  const target = {};
  deepmergeInto(target, a, b);
  t.deepEqual(target, expected);

  t.throws(() => {
    deepmergeInto(a, b);
  });
});

test("prototype pollution", (t) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const payload = '{"__proto__":{"a0":true}}';

  const x: any = JSON.parse(payload);
  const y: any = {};

  deepmergeInto(x, y);

  t.deepEqual(JSON.stringify(x), payload);

  t.not(({} as any).a0, true, "Safe POJO");
  t.not(x.a0, true, "Safe x input");
  t.not(y.a0, true, "Safe y input");
  t.not(x.a0, true, "Safe output");
  /* eslint-enable @typescript-eslint/no-explicit-any */
});
