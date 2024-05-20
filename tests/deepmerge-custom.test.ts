import _ from "lodash";
import { describe, expect, it } from "vitest";

import {
  type DeepMergeLeaf,
  type DeepMergeLeafURI,
  type DeepMergeMergeFunctionsURIs,
  type DeepMergeNoFilteringURI,
  type DeepMergeOptions,
  type DeepMergeRecordsDefaultHKT,
  deepmergeCustom,
} from "../src";
import { type FilterOut } from "../src/types/utils";

import { areAllNumbers, hasProp } from "./utils";

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs,
    M,
  > {
    readonly CustomArrays1: string[];
  }
}

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs,
    M,
  > {
    readonly CustomArrays2: Ts extends Readonly<
      readonly [ReadonlyArray<unknown>]
    >
      ? unknown[]
      : never;
    readonly CustomOthers2: string;
  }
}

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs,
    M,
  > {
    readonly CustomRecords3: Entries<DeepMergeRecordsDefaultHKT<Ts, MF, M>>;
  }
}

type Entries<T> = Array<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
>;

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs,
    M,
  > {
    readonly NoArrayMerge1: DeepMergeLeaf<Ts>;
  }
}

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs,
    M,
  > {
    readonly MergeDates1: EveryIsDate<Ts> extends true ? Ts : DeepMergeLeaf<Ts>;
  }
}

type EveryIsDate<Ts extends ReadonlyArray<unknown>> =
  Ts extends Readonly<readonly [infer Head, ...infer Rest]>
    ? Head extends Date
      ? EveryIsDate<Rest>
      : false
    : true;

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends Readonly<ReadonlyArray<unknown>>,
    MF extends DeepMergeMergeFunctionsURIs,
    M,
  > {
    readonly KeyPathBasedMerge: Ts[number] extends number
      ? Ts[number] | string
      : DeepMergeLeaf<Ts>;
  }
}

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs,
    M,
  > {
    readonly CustomOthers3: Ts[number] extends object
      ? DeepMergeRecordsDefaultHKT<
          {
            [I in keyof Ts]: {
              [J in keyof Ts[I]]: Ts[I][J];
            };
          },
          MF,
          M
        >
      : DeepMergeLeaf<Ts>;
  }
}

declare module "../src/types" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs,
    M,
  > {
    readonly CustomFilterValues1: FilterOut<Ts, null>;
  }
}

describe("deepmergeCustom", () => {
  it("works just like non-customized version when no options passed", () => {
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

    expect(merged).toStrictEqual(expected);
  });

  it("custom merge strings", () => {
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

    expect(merged).toStrictEqual(expected);
  });

  it("custom merge arrays", () => {
    const x = { foo: { bar: { baz: { qux: [1, 2, 3] } } } };
    const y = { foo: { bar: { baz: { qux: ["a", "b", "c"] } } } };

    const expected = {
      foo: { bar: { baz: { qux: ["1a", "2b", "3c"] } } },
    };

    const customizedDeepmerge = deepmergeCustom<
      unknown,
      {
        DeepMergeArraysURI: "CustomArrays1";
      }
    >({
      mergeArrays: (arrays) => {
        const maxLength = Math.max(...arrays.map((array) => array.length));

        const result = [];

        for (let m_i = 0; m_i < maxLength; m_i++) {
          result[m_i] = "";

          for (const array of arrays) {
            if (m_i >= array.length) {
              break;
            }
            // eslint-disable-next-line ts/restrict-template-expressions
            result[m_i] += `${array[m_i]}`;
          }
        }

        return result;
      },
    });

    const merged = customizedDeepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("custom merge arrays of records", () => {
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

    const customizedDeepmerge = deepmergeCustom<
      unknown,
      {
        DeepMergeArraysURI: "CustomArrays2";
        DeepMergeOthersURI: "CustomOthers2";
      }
    >({
      mergeArrays: (arrays, utils) => {
        const maxLength = Math.max(...arrays.map((array) => array.length));
        const m_result: unknown[] = [];

        for (let m_i = 0; m_i < maxLength; m_i++) {
          const never = {};
          m_result.push(
            utils.deepmerge(
              ...arrays
                .map((array) => (m_i < array.length ? array[m_i] : never))
                .filter((value) => value !== never),
            ),
          );
        }

        return m_result;
      },
      mergeOthers: (values) => {
        if (values.every((value) => typeof value === "number")) {
          return String.fromCodePoint(
            values.reduce<number>(
              (carry, value) => carry + (value as number),
              0,
            ),
          );
        }
        return "";
      },
    });

    const merged = customizedDeepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("custom merge records", () => {
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

    const customizedDeepmerge = deepmergeCustom<
      unknown,
      {
        DeepMergeRecordsURI: "CustomRecords3";
      }
    >({
      mergeRecords: (records, utils, meta) =>
        Object.entries(
          utils.defaultMergeFunctions.mergeRecords(records, utils, meta),
        ),
    });

    const merged = customizedDeepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("custom don't merge arrays", () => {
    const v = { foo: [1, 2] } as const;
    const x = { foo: [3, 4] } as const;
    const y = { foo: [5, 6] } as const;
    const z = { foo: [7, 8] } as const;

    const expected = { foo: [7, 8] } as const;

    const customizedDeepmerge = deepmergeCustom<
      unknown,
      {
        DeepMergeArraysURI: DeepMergeLeafURI;
      }
    >({
      mergeArrays: false,
    });

    const merged = customizedDeepmerge(v, x, y, z);

    expect(merged).toStrictEqual(expected);
  });

  it("custom merge dates", () => {
    const x = { foo: new Date("2020-01-01") };
    const y = { foo: new Date("2021-02-02") };
    const z = { foo: new Date("2022-03-03") };

    const expected = { foo: [x.foo, y.foo, z.foo] } as const;

    const customizedDeepmerge = deepmergeCustom<
      unknown,
      {
        DeepMergeOthersURI: "MergeDates1";
      }
    >({
      mergeOthers: (values, utils) => {
        if (values.every((value) => value instanceof Date)) {
          return values;
        }
        return utils.defaultMergeFunctions.mergeOthers(values);
      },
    });

    const merged = customizedDeepmerge(x, y, z);

    expect(merged).toStrictEqual(expected);
  });

  it("key based merging", () => {
    const v = { sum: 1, product: 2, mean: 3 };
    const x = { sum: 4, product: 5, mean: 6 };
    const y = { sum: 7, product: 8, mean: 9 };
    const z = { sum: 10, product: 11, mean: 12 };

    const expected = {
      sum: 22,
      product: 880,
      mean: 7.5,
    };

    const customizedDeepmerge = deepmergeCustom({
      mergeOthers: (values, utils, meta) => {
        if (meta !== undefined && areAllNumbers(values)) {
          const { key } = meta;
          const numbers: ReadonlyArray<number> = values;

          if (key === "sum") {
            return numbers.reduce((sum, value) => sum + value);
          }
          if (key === "product") {
            return numbers.reduce((prod, value) => prod * value);
          }
          if (key === "mean") {
            return numbers.reduce((sum, value) => sum + value) / numbers.length;
          }
        }

        return utils.defaultMergeFunctions.mergeOthers(values);
      },
    });

    const merged = customizedDeepmerge(v, x, y, z);

    expect(merged).toStrictEqual(expected);
  });

  it("key path based merging", () => {
    const x = {
      foo: { bar: { baz: 1, qux: 2 } },
      bar: { baz: 3, qux: 4 },
    };
    const y = {
      foo: { bar: { baz: 5, bar: { baz: 6, qux: 7 } } },
      bar: { baz: 8, qux: 9 },
    };

    const expected = {
      foo: { bar: { baz: "special merge", bar: { baz: 6, qux: 7 }, qux: 2 } },
      bar: { baz: "special merge", qux: 9 },
    };

    const customizedDeepmerge = deepmergeCustom<
      unknown,
      {
        DeepMergeOthersURI: "KeyPathBasedMerge";
      },
      ReadonlyArray<PropertyKey>
    >({
      metaDataUpdater: (previousMeta, metaMeta) => {
        if (metaMeta.key === undefined) {
          return previousMeta ?? [];
        }
        return [...(previousMeta ?? []), metaMeta.key];
      },
      mergeOthers: (values, utils, meta) => {
        if (
          meta !== undefined &&
          meta.length >= 2 &&
          meta.at(-2) === "bar" &&
          meta.at(-1) === "baz"
        ) {
          return "special merge";
        }

        return utils.defaultMergeFunctions.mergeOthers(values);
      },
    });

    const merged = customizedDeepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("key path based array merging", () => {
    const x = {
      foo: [
        { id: 1, value: ["a"] },
        { id: 2, value: ["b"] },
      ],
      bar: [1, 2, 3],
      baz: {
        qux: [
          { id: 1, value: ["c"] },
          { id: 2, value: ["d"] },
        ],
      },
      qux: [
        { id: 1, value: ["e"] },
        { id: 2, value: ["f"] },
      ],
    };
    const y = {
      foo: [
        { id: 2, value: ["g"] },
        { id: 1, value: ["h"] },
      ],
      bar: [4, 5, 6],
      baz: {
        qux: [
          { id: 2, value: ["i"] },
          { id: 1, value: ["j"] },
        ],
      },
      qux: [
        { id: 2, value: ["k"] },
        { id: 1, value: ["l"] },
      ],
    };

    const expected = {
      foo: [
        { id: 1, value: ["a", "h"] },
        { id: 2, value: ["b", "g"] },
      ],
      bar: [1, 2, 3, 4, 5, 6],
      baz: {
        qux: [
          { id: 1, value: ["c", "j"] },
          { id: 2, value: ["d", "i"] },
        ],
      },
      qux: [
        { id: 1, value: ["e"] },
        { id: 2, value: ["f"] },
        { id: 2, value: ["k"] },
        { id: 1, value: ["l"] },
      ],
    };

    const customizedDeepmergeEntry = <K extends PropertyKey>(
      ...idsPaths: ReadonlyArray<ReadonlyArray<K>>
    ) => {
      const mergeSettings: DeepMergeOptions<
        ReadonlyArray<unknown>,
        Readonly<{ id: unknown }>
      > = {
        metaDataUpdater: (previousMeta, metaMeta) => [
          ...(previousMeta ?? []),
          metaMeta.key ?? metaMeta.id,
        ],
        mergeArrays: (values, utils, meta = []) => {
          const idPath = idsPaths.find((idPath) => {
            const parentPath = idPath.slice(0, -1);
            return (
              parentPath.length === meta.length &&
              parentPath.every((part, i) => part === meta[i])
            );
          });
          if (idPath === undefined) {
            return utils.defaultMergeFunctions.mergeArrays(values);
          }

          const id = idPath.at(-1)!;
          const valuesById = values.reduce<Map<unknown, unknown[]>>(
            (carry, current) => {
              const currentElementsById = new Map<unknown, unknown>();

              for (const element of current) {
                if (!hasProp(element, id)) {
                  throw new Error("Invalid element type");
                }
                if (currentElementsById.has(element[id])) {
                  throw new Error("multiple elements with the same id");
                }
                currentElementsById.set(element[id], element);

                const currentList = carry.get(element[id]) ?? [];
                carry.set(element[id], [...currentList, element]);
              }
              return carry;
            },
            new Map<unknown, unknown[]>(),
          );

          return [...valuesById.entries()].reduce<unknown[]>(
            (carry, [id, values]) => {
              const childMeta = utils.metaDataUpdater(meta, { id });
              return [
                ...carry,
                deepmergeCustom(mergeSettings, childMeta)(...values),
              ];
            },
            [],
          );
        },
      };

      return deepmergeCustom(mergeSettings, []);
    };

    const merged = customizedDeepmergeEntry(
      ["foo", "id"],
      ["baz", "qux", "id"],
    )(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("custom merge with parents", () => {
    const v = { sum: 1, isBadObject: true };
    const x = { sum: 2, isBadObject: false };
    const y = { sum: 3, isBadObject: true };
    const z = { sum: 4, isBadObject: false };

    const expected = {
      sum: 6,
      isBadObject: false,
    };

    const customizedDeepmerge = deepmergeCustom({
      mergeOthers: (values, utils, meta) => {
        if (meta !== undefined) {
          const { key, parents } = meta;
          if (key === "isBadObject") {
            return false;
          }

          const goodValues: number[] = values.filter(
            (value, index): value is number =>
              parents[index]!["isBadObject"] !== true &&
              typeof value === "number",
          );

          if (key === "sum") {
            return goodValues.reduce((sum, value) => sum + value, 0);
          }
        }
        return utils.defaultMergeFunctions.mergeOthers(values);
      },
    });

    const merged = customizedDeepmerge(v, x, y, z);

    expect(merged).toStrictEqual(expected);
  });

  it("custom merge that clones", () => {
    const x = { foo: { bar: { baz: { qux: [1, 2, 3] } } } };
    const y = { bar: new Date("2021-02-02"), baz: { qux: 1 } };

    const expected = {
      foo: _.cloneDeep(x.foo),
      bar: _.cloneDeep(y.bar),
      baz: _.cloneDeep(y.baz),
    } as const;

    const customizedDeepmerge = deepmergeCustom({
      mergeOthers: (values, utils) =>
        _.cloneDeep(utils.defaultMergeFunctions.mergeOthers(values)),
    });

    const merged = customizedDeepmerge(x, y);

    expect(merged).toStrictEqual(expected);
    expect(merged.foo).not.toBe(x.foo);
    expect(merged.foo.bar).not.toBe(x.foo.bar);
    expect(merged.foo.bar.baz).not.toBe(x.foo.bar.baz);
    expect(merged.foo.bar.baz.qux).not.toBe(x.foo.bar.baz.qux);
    expect(merged.bar).not.toBe(y.bar);
    expect(merged.baz).not.toBe(y.baz);
  });

  it("implicit default merging", () => {
    const x = {
      foo: 1,
      bar: { baz: [2], qux: new Set([1]), quux: new Map([[1, 2]]) },
    };
    const y = {
      foo: 3,
      bar: { baz: [4], qux: new Set([2]), quux: new Map([[2, 3]]) },
    };

    const expected = {
      foo: 3,
      bar: {
        baz: [2, 4],
        qux: new Set([1, 2]),
        quux: new Map([
          [1, 2],
          [2, 3],
        ]),
      },
    };

    const customizedDeepmerge = deepmergeCustom({
      enableImplicitDefaultMerging: true,
      mergeRecords: () => undefined,
      mergeArrays: () => undefined,
      mergeSets: () => undefined,
      mergeMaps: () => undefined,
      mergeOthers: () => undefined,
    });

    const merged = customizedDeepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("default merging using actions", () => {
    const x = {
      foo: 1,
      bar: { baz: [2], qux: new Set([1]), quux: new Map([[1, 2]]) },
    };
    const y = {
      foo: 3,
      bar: { baz: [4], qux: new Set([2]), quux: new Map([[2, 3]]) },
    };

    const expected = {
      foo: 3,
      bar: {
        baz: [2, 4],
        qux: new Set([1, 2]),
        quux: new Map([
          [1, 2],
          [2, 3],
        ]),
      },
    };

    const customizedDeepmerge = deepmergeCustom({
      mergeRecords: (value, utils) => utils.actions.defaultMerge,
      mergeArrays: (value, utils) => utils.actions.defaultMerge,
      mergeSets: (value, utils) => utils.actions.defaultMerge,
      mergeMaps: (value, utils) => utils.actions.defaultMerge,
      mergeOthers: (value, utils) => utils.actions.defaultMerge,
    });

    const merged = customizedDeepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("skip property", () => {
    const x = {
      foo: { bar: 1, baz: 2, qux: ["a"] },
      bar: [1, 2, 3],
    };
    const y = {
      foo: { bar: 3, baz: 4, qux: ["b"] },
      bar: [4, 5, 6],
    };

    const expected = {
      foo: { baz: 4, qux: ["a", "b"] },
      bar: [1, 2, 3, 4, 5, 6],
    };

    const customizedDeepmerge = deepmergeCustom({
      mergeOthers: (value, utils, meta) =>
        meta?.key === "bar" ? utils.actions.skip : utils.actions.defaultMerge,
    });

    const merged = customizedDeepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it("merging class object as record", () => {
    class Klass {
      public readonly prop1 = 1 as const;
      public readonly prop2 = 2 as const;
    }

    const x = new Klass();
    const y = { foo: false };

    const expected = {
      prop1: 1,
      prop2: 2,
      foo: false,
    };

    const customizedDeepmerge = deepmergeCustom<
      unknown,
      {
        DeepMergeOthersURI: "CustomOthers3";
      }
    >({
      mergeOthers: (values, utils, meta) => {
        let m_allRecords = true;
        const records = values.map((v) => {
          if (typeof v === "object" && v !== null) {
            return { ...v };
          }
          m_allRecords = false;
          return false;
        });
        // eslint-disable-next-line ts/no-unnecessary-condition
        if (m_allRecords) {
          return utils.mergeFunctions.mergeRecords(records, utils, meta);
        }
        return utils.actions.defaultMerge;
      },
    });

    const merged = customizedDeepmerge(x, y);

    expect(merged).toStrictEqual(expected);
  });

  it(`null can be filtered out`, () => {
    const x = { key1: { subkey1: `one` } };
    const y = { key1: null };
    const z = { key1: { subkey2: `two` } };

    const expected = { key1: { subkey1: `one`, subkey2: `two` } };

    const customizedDeepmerge = deepmergeCustom<
      unknown,
      {
        DeepMergeFilterValuesURI: "CustomFilterValues1";
      }
    >({
      filterValues(values) {
        return values.filter((value) => value !== null);
      },
    });

    const merged = customizedDeepmerge(x, y, z);

    expect(merged).toStrictEqual(expected);
  });

  it(`filtered out nothing`, () => {
    const x = { key1: { subkey1: `one` } };
    const y = { key1: undefined };
    const z = { key1: { subkey2: `two` } };

    const expected = { key1: { subkey2: `two` } };

    const customizedDeepmerge = deepmergeCustom<
      unknown,
      {
        DeepMergeFilterValuesURI: DeepMergeNoFilteringURI;
      }
    >({
      filterValues: false,
    });

    const merged = customizedDeepmerge(x, y, z);

    expect(merged).toStrictEqual(expected);
  });
});
