import test from "ava";

import { deepmergeCustom } from "../src/deepmerge";

test("custom merge strings", (t) => {
  const v = { foo: { bar: { baz: { qux: "a" } } } };
  const x = { foo: { bar: { baz: { qux: "b" } } } };
  const y = { foo: { bar: { baz: { qux: "c" } } } };
  const z = { foo: { bar: { baz: { qux: "d" } } } };

  const expected = {
    foo: { bar: { baz: { qux: "a b c d" } } },
  };

  const customizedDeepmerge = deepmergeCustom({
    mergeOthers: (object1, object2) => {
      if (typeof object1 === "string" && typeof object2 === "string") {
        return `${object1} ${object2}`;
      }
      return object2;
    },
  });

  const merged = customizedDeepmerge(v, x, y, z);

  t.deepEqual(merged, expected);
});

test("custom merge arrays", (t) => {
  const x = { foo: { bar: { baz: { qux: [1, 2, 3] } } } };
  const y = { foo: { bar: { baz: { qux: ["a", "b", "c"] } } } };

  const expected = {
    foo: { bar: { baz: { qux: ["1a", "2b", "3c"] } } },
  };

  const customizedDeepmerge = deepmergeCustom({
    mergeArrays: (array1, array2) => array1.map((e, i) => `${e}${array2[i]}`),
  });

  const merged = customizedDeepmerge(x, y);

  t.deepEqual(merged, expected);
});

test("custom merge arrays of records", (t) => {
  const x = {
    foo: [
      { bar: { baz: [{ qux: 1 }] } },
      { bar: { baz: [{ qux: 2 }] } },
      { bar: { baz: [{ qux: 3 }] } },
    ],
  };
  const y = {
    foo: [
      { bar: { baz: [{ qux: 4 }] } },
      { bar: { baz: [{ qux: 5 }] } },
      { bar: { baz: [{ qux: 6 }] } },
    ],
  };

  const expected = {
    foo: [
      { bar: { baz: [{ qux: 5 }] } },
      { bar: { baz: [{ qux: 7 }] } },
      { bar: { baz: [{ qux: 9 }] } },
    ],
  };

  const customizedDeepmerge = deepmergeCustom({
    mergeArrays: (array1, array2, utils) => {
      const maxLength = Math.max(array1.length, array2.length);
      const result: unknown[] = [];

      for (let i = 0; i < maxLength; i++) {
        if (i < array1.length && i < array2.length) {
          result.push(utils.deepmerge(array1[i], array2[i]));
        } else if (i < array1.length) {
          result.push(array1[i]);
        } else if (i < array2.length) {
          result.push(array2[i]);
        }
      }

      return result;
    },
    mergeOthers: (item1, item2) => {
      if (typeof item1 === "number" && typeof item2 === "number") {
        return item1 + item2;
      }
      return item2;
    },
  });

  const merged = customizedDeepmerge(x, y);

  t.deepEqual(merged, expected);
});
