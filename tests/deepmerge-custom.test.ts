import test from "ava";

import { deepmergeCustom } from "../src/deepmerge";
import type {
  DeepMergeMergeFunctionsURIs,
  DeepMergeUnknownsHKT,
  DeepMergeRecordsDefaultHKT,
} from "../src/types";

test("works just like non-customized version when no options passed", (t) => {
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

  const merged = deepmergeCustom({})(v, x, y, z);

  t.deepEqual(merged, expected);
});

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

declare module "../src/types" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DeepMergeMergeFunctionURItoKind<
    T1,
    T2,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    readonly CustomArrays1: string[];
  }
}

test("custom merge arrays", (t) => {
  const x = { foo: { bar: { baz: { qux: [1, 2, 3] } } } };
  const y = { foo: { bar: { baz: { qux: ["a", "b", "c"] } } } };

  const expected = {
    foo: { bar: { baz: { qux: ["1a", "2b", "3c"] } } },
  };

  const customizedDeepmerge = deepmergeCustom<{
    DeepMergeArraysURI: "CustomArrays1";
  }>({
    mergeArrays: (array1, array2) => array1.map((e, i) => `${e}${array2[i]}`),
  });

  const merged = customizedDeepmerge(x, y);

  t.deepEqual(merged, expected);
});

declare module "../src/types" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DeepMergeMergeFunctionURItoKind<
    T1,
    T2,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    readonly CustomArrays2: T1 extends Readonly<ReadonlyArray<infer E1>>
      ? T2 extends Readonly<ReadonlyArray<infer E2>>
        ? Array<DeepMergeUnknownsHKT<E1, E2, MF>>
        : never
      : never;
    readonly CustomOthers2: string;
  }
}

test("custom merge arrays of records", (t) => {
  const x = {
    foo: [
      { bar: { baz: [{ qux: 35 }] } },
      { bar: { baz: [{ qux: 36 }] } },
      { bar: { baz: [{ qux: 37 }] } },
    ],
  };
  const y = {
    foo: [
      { bar: { baz: [{ qux: 38 }] } },
      { bar: { baz: [{ qux: 39 }] } },
      { bar: { baz: [{ qux: 40 }] } },
    ],
  };

  const expected = {
    foo: [
      { bar: { baz: [{ qux: "I" }] } },
      { bar: { baz: [{ qux: "K" }] } },
      { bar: { baz: [{ qux: "M" }] } },
    ],
  };

  const customizedDeepmerge = deepmergeCustom<{
    DeepMergeArraysURI: "CustomArrays2";
    DeepMergeOthersURI: "CustomOthers2";
  }>({
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
        return String.fromCharCode(item1 + item2);
      }
      return "";
    },
  });

  const merged = customizedDeepmerge(x, y);

  t.deepEqual(merged, expected);
});

declare module "../src/types" {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface DeepMergeMergeFunctionURItoKind<
    T1,
    T2,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    readonly CustomRecords3: Entries<DeepMergeRecordsDefaultHKT<T1, T2, MF>>;
  }

  type Entries<T> = Array<
    {
      [K in keyof T]: [K, T[K]];
    }[keyof T]
  >;
}

test("custom merge records", (t) => {
  const x = {
    foo: {
      bar: 1,
    },
  };
  const y = {
    foo: {
      qux: 4,
    },
  };

  const expected = [
    [
      "foo",
      [
        ["bar", 1],
        ["qux", 4],
      ],
    ],
  ];

  const customizedDeepmerge = deepmergeCustom<{
    DeepMergeRecordsURI: "CustomRecords3";
  }>({
    mergeRecords: (record1, record2, utils) =>
      Object.entries(
        utils.defaultMergeFunctions.mergeRecords(record1, record2, utils)
      ),
  });

  const merged = customizedDeepmerge(x, y);

  t.deepEqual(merged, expected);
});
