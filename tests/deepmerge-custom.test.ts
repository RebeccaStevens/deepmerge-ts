/* eslint-disable @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-unused-vars */

import test from "ava";

import { deepmergeCustom } from "@/deepmerge";
import type {
  DeepMergeLeafURI,
  DeepMergeMergeFunctionsURIs,
  DeepMergeRecordsDefaultHKT,
  DeepMergeLeaf,
} from "@/deepmerge";

declare module "ava" {
  interface DeepEqualAssertion {
    /**
     * Assert that `actual` is [deeply equal](https://github.com/concordancejs/concordance#comparison-details) to
     * `expected`, returning a boolean indicating whether the assertion passed.
     */
    <Actual extends Expected, Expected>(
      actual: Actual,
      expected: Expected,
      message?: string
    ): expected is Actual;
  }
}

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
    mergeOthers: (values, utils) => {
      if (values.every((value) => typeof value === "string")) {
        return values.join(" ");
      }
      return utils.defaultMergeFunctions.mergeOthers(values);
    },
  });

  const merged = customizedDeepmerge(v, x, y, z);

  t.deepEqual(merged, expected);
});

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
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
    mergeArrays: (arrays) => {
      const maxLength = Math.max(...arrays.map((array) => array.length));

      const result = [];
      for (let i = 0; i < maxLength; i++) {
        result[i] = "";

        for (const array of arrays) {
          if (i >= array.length) {
            break;
          }
          result[i] += `${array[i]}`;
        }
      }

      return result;
    },
  });

  const merged = customizedDeepmerge(x, y);

  t.deepEqual(merged, expected);
});

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    readonly CustomArrays2: Ts extends Readonly<readonly [...infer Es]>
      ? Es extends ReadonlyArray<unknown>
        ? unknown[]
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
    mergeArrays: (arrays, utils) => {
      const maxLength = Math.max(...arrays.map((array) => array.length));
      const result: unknown[] = [];

      for (let i = 0; i < maxLength; i++) {
        const never = {};
        result.push(
          utils.deepmerge(
            ...arrays
              .map((array) => (i < array.length ? array[i] : never))
              .filter((value) => value !== never)
          )
        );
      }

      return result;
    },
    mergeOthers: (values) => {
      if (values.every((value) => typeof value === "number")) {
        return String.fromCodePoint(
          values.reduce<number>((carry, value) => carry + (value as number), 0)
        );
      }
      return "";
    },
  });

  const merged = customizedDeepmerge(x, y);

  t.deepEqual(merged, expected);
});

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    readonly CustomRecords3: Entries<DeepMergeRecordsDefaultHKT<Ts, MF>>;
  }
}

type Entries<T> = Array<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;

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
    mergeRecords: (records, utils) =>
      Object.entries(utils.defaultMergeFunctions.mergeRecords(records, utils)),
  });

  const merged = customizedDeepmerge(x, y);

  t.deepEqual(merged, expected);
});

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    readonly NoArrayMerge1: DeepMergeLeaf<Ts>;
  }
}

test("custom don't merge arrays", (t) => {
  const v = { foo: [1, 2] } as const;
  const x = { foo: [3, 4] } as const;
  const y = { foo: [5, 6] } as const;
  const z = { foo: [7, 8] } as const;

  const expected = { foo: [7, 8] } as const;

  const customizedDeepmerge = deepmergeCustom<{
    DeepMergeArraysURI: DeepMergeLeafURI;
  }>({
    mergeArrays: false,
  });

  const merged = customizedDeepmerge(v, x, y, z);

  t.deepEqual(merged, expected);
});

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    readonly MergeDates1: EveryIsDate<Ts> extends true ? Ts : DeepMergeLeaf<Ts>;
  }
}

type EveryIsDate<Ts extends ReadonlyArray<unknown>> = Ts extends Readonly<
  readonly [infer Head, ...infer Rest]
>
  ? Head extends Date
    ? EveryIsDate<Rest>
    : false
  : true;

test("custom merge dates", (t) => {
  const x = { foo: new Date("2020-01-01") };
  const y = { foo: new Date("2021-02-02") };
  const z = { foo: new Date("2022-03-03") };

  const expected = { foo: [x.foo, y.foo, z.foo] } as const;

  const customizedDeepmerge = deepmergeCustom<{
    DeepMergeOthersURI: "MergeDates1";
  }>({
    mergeOthers: (values, utils) => {
      if (values.every((value) => value instanceof Date)) {
        return values;
      }
      return utils.defaultMergeFunctions.mergeOthers(values);
    },
  });

  const merged = customizedDeepmerge(x, y, z);

  t.deepEqual(merged, expected);
});
