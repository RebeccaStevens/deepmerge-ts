import _ from "lodash";
import { describe, expect, it } from "vitest";

import { type DeepMergeIntoOptions, type DeepMergeValueReference, deepmergeIntoCustom } from "../src/index.ts";
import { getKeys } from "../src/utils.ts";

import { areAllNumbers, hasProp } from "./utils.ts";

describe("deepmergeIntoCustom", () => {
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

    deepmergeIntoCustom({})(v, x, y, z);

    expect(v).toStrictEqual(expected);
  });

  it("custom merge strings", () => {
    const v = { foo: { bar: { baz: { qux: "a" } } } };
    const x = { foo: { bar: { baz: { qux: "b" } } } };
    const y = { foo: { bar: { baz: { qux: "c" } } } };
    const z = { foo: { bar: { baz: { qux: "d" } } } };

    const expected = {
      foo: { bar: { baz: { qux: "a b c d" } } },
    };

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeOthers: (mut_target, values, utils) => {
        if (values.every((value) => typeof value === "string")) {
          mut_target.value = values.join(" ");
          return;
        }
        utils.defaultMergeFunctions.mergeOthers(mut_target, values);
      },
    });

    customizedDeepmerge(v, x, y, z);

    expect(v).toStrictEqual(expected);
  });

  it("custom merge arrays", () => {
    const x = { foo: { bar: { baz: { qux: [1, 2, 3] } } } };
    const y = { foo: { bar: { baz: { qux: ["a", "b", "c"] } } } };

    const expected = {
      foo: { bar: { baz: { qux: ["1a", "2b", "3c"] } } },
    };

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeArrays: (mut_target, arrays) => {
        const maxLength = Math.max(...arrays.map((array) => array.length));

        const result = [];

        for (let mut_i = 0; mut_i < maxLength; mut_i++) {
          result[mut_i] = "";

          for (const array of arrays) {
            if (mut_i >= array.length) {
              break;
            }
            // eslint-disable-next-line ts/restrict-template-expressions
            result[mut_i] += `${array[mut_i]}`;
          }
        }

        mut_target.value = result;
      },
    });

    customizedDeepmerge(x, y);

    expect(x).toStrictEqual(expected);
  });

  it("custom merge arrays of records", () => {
    const x = {
      foo: [{ bar: { baz: [{ qux: 35 }] } }, { bar: { baz: [{ qux: 36 }] } }, { bar: { baz: [{ qux: 37 }] } }],
    };
    const y = {
      foo: [{ bar: { baz: [{ qux: 38 }] } }, { bar: { baz: [{ qux: 39 }] } }, { bar: { baz: [{ qux: 40 }] } }],
    };

    const expected = {
      foo: [{ bar: { baz: [{ qux: "I" }] } }, { bar: { baz: [{ qux: "K" }] } }, { bar: { baz: [{ qux: "M" }] } }],
    };

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeArrays: (mut_target, arrays, utils) => {
        const maxLength = Math.max(...arrays.map((array) => array.length));
        const mut_result: unknown[] = [];

        for (let mut_i = 0; mut_i < maxLength; mut_i++) {
          const never = {};
          const s = {};
          utils.deepmergeInto(
            s,
            ...arrays.map((array) => (mut_i < array.length ? array[mut_i] : never)).filter((value) => value !== never),
          );
          mut_result.push(s);
        }

        mut_target.value = mut_result;
      },
      mergeOthers: (mut_target, values) => {
        if (values.every((value) => typeof value === "number")) {
          mut_target.value = String.fromCodePoint(
            values.reduce<number>((carry, value) => carry + (value as number), 0),
          );
          return;
        }
        mut_target.value = "";
      },
    });

    customizedDeepmerge(x, y);

    expect(x).toStrictEqual(expected);
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

    const expected = {
      foo: "foo",
    };

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeRecords: (mut_target, records, utils, meta) => {
        for (const key of getKeys(records)) {
          mut_target.value[key] = key;
        }
      },
    });

    customizedDeepmerge(x, y);

    expect(x).toStrictEqual(expected);
  });

  it("custom don't merge arrays", () => {
    const v = { foo: [1, 2] } as const;
    const x = { foo: [3, 4] } as const;
    const y = { foo: [5, 6] } as const;
    const z = { foo: [7, 8] } as const;

    const expected = { foo: [7, 8] } as const;

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeArrays: false,
    });

    customizedDeepmerge(v, x, y, z);

    expect(v).toStrictEqual(expected);
  });

  type EveryIsDate<Ts extends ReadonlyArray<unknown>> =
    Ts extends Readonly<readonly [infer Head, ...infer Rest]> ? (Head extends Date ? EveryIsDate<Rest> : false) : true;

  it("custom merge dates", () => {
    const x = { foo: new Date("2020-01-01") };
    const y = { foo: new Date("2021-02-02") };
    const z = { foo: new Date("2022-03-03") };

    const expected = { foo: [x.foo, y.foo, z.foo] } as const;

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeOthers: (mut_target, values, utils) => {
        if (values.every((value) => value instanceof Date)) {
          mut_target.value = values;
          return;
        }
        utils.defaultMergeFunctions.mergeOthers(mut_target, values);
      },
    });

    customizedDeepmerge(x, y, z);

    expect(x).toStrictEqual(expected);
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

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeOthers: (mut_target, values, utils, meta) => {
        if (meta !== undefined && areAllNumbers(values)) {
          const { key } = meta;
          const numbers: ReadonlyArray<number> = values;

          if (key === "sum") {
            mut_target.value = numbers.reduce((sum, value) => sum + value);
            return;
          }
          if (key === "product") {
            mut_target.value = numbers.reduce((prod, value) => prod * value);
            return;
          }
          if (key === "mean") {
            mut_target.value = numbers.reduce((sum, value) => sum + value) / numbers.length;
            return;
          }
        }

        utils.defaultMergeFunctions.mergeOthers(mut_target, values);
      },
    });

    customizedDeepmerge(v, x, y, z);

    expect(v).toStrictEqual(expected);
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

    const customizedDeepmerge = deepmergeIntoCustom<unknown, ReadonlyArray<PropertyKey>>({
      metaDataUpdater: (previousMeta, metaMeta) => {
        if (metaMeta.key === undefined) {
          return previousMeta ?? [];
        }
        return [...(previousMeta ?? []), metaMeta.key];
      },
      mergeOthers: (mut_target, values, utils, meta): void => {
        if (meta !== undefined && meta.length >= 2 && meta.at(-2) === "bar" && meta.at(-1) === "baz") {
          mut_target.value = "special merge";
          return;
        }

        utils.defaultMergeFunctions.mergeOthers(mut_target, values);
      },
    });

    customizedDeepmerge(x, y);

    expect(x).toStrictEqual(expected);
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

    const customizedDeepmergeEntry = <K extends PropertyKey>(...idsPaths: ReadonlyArray<ReadonlyArray<K>>) => {
      const mergeSettings: DeepMergeIntoOptions<ReadonlyArray<unknown>, Readonly<{ id: unknown }>> = {
        metaDataUpdater: (previousMeta, metaMeta) => [...(previousMeta ?? []), metaMeta.key ?? metaMeta.id],
        mergeArrays: (mut_target, values, utils, meta = []) => {
          const idPath = idsPaths.find((idPath) => {
            const parentPath = idPath.slice(0, -1);
            return parentPath.length === meta.length && parentPath.every((part, i) => part === meta[i]);
          });
          if (idPath === undefined) {
            utils.defaultMergeFunctions.mergeArrays(mut_target, values);
            return;
          }

          const id = idPath.at(-1)!;
          const valuesById = values.reduce<Map<unknown, Array<Record<PropertyKey, unknown>>>>((carry, current) => {
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
          }, new Map<unknown, Array<Record<PropertyKey, unknown>>>());

          mut_target.value = [...valuesById.entries()].reduce<unknown[]>((carry, [id, values]) => {
            const childMeta = utils.metaDataUpdater(meta, { id });
            const s = {};
            deepmergeIntoCustom(mergeSettings, childMeta)(s, ...values);
            return [...carry, s];
          }, []);
        },
      };

      return deepmergeIntoCustom(mergeSettings, []);
    };

    customizedDeepmergeEntry(["foo", "id"], ["baz", "qux", "id"])(x, y);

    expect(x).toStrictEqual(expected);
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

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeOthers: (mut_target, values, utils, meta): void => {
        if (meta !== undefined) {
          const { key, parents } = meta;
          if (key === "isBadObject") {
            mut_target.value = false;
            return;
          }

          const goodValues = values.filter(
            (value, index): value is number => parents[index]!["isBadObject"] !== true && typeof value === "number",
          );

          if (key === "sum") {
            mut_target.value = goodValues.reduce((sum, value) => sum + value, 0);
            return;
          }
        }
        utils.defaultMergeFunctions.mergeOthers(mut_target, values);
      },
    });

    customizedDeepmerge(v, x, y, z);

    expect(v).toStrictEqual(expected);
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

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeRecords: (target, values, utils) => utils.actions.defaultMerge,
      mergeArrays: (target, values, utils) => utils.actions.defaultMerge,
      mergeSets: (target, values, utils) => utils.actions.defaultMerge,
      mergeMaps: (target, values, utils) => utils.actions.defaultMerge,
      mergeOthers: (target, values, utils) => utils.actions.defaultMerge,
    });

    customizedDeepmerge(x, y);

    expect(x).toStrictEqual(expected);
  });

  it("merging class object as record", () => {
    class Klass {
      public readonly prop1 = 1;
      public readonly prop2 = 2;
    }

    const x = new Klass();
    const y = { foo: false };

    const expected = {
      prop1: 1,
      prop2: 2,
      foo: false,
    };

    const customizedDeepmerge = deepmergeIntoCustom({
      mergeOthers: (mut_target, values, utils, meta) => {
        let mut_allRecords = true;
        const records = values.map((v) => {
          if (typeof v === "object" && v !== null) {
            return { ...v };
          }
          mut_allRecords = false;
          return false;
        });
        // eslint-disable-next-line ts/no-unnecessary-condition
        if (mut_allRecords) {
          utils.mergeFunctions.mergeRecords(
            mut_target as DeepMergeValueReference<Record<PropertyKey, unknown>>,
            records,
            utils,
            meta,
          );
          return;
        }
        mut_target.value = utils.actions.defaultMerge;
      },
    });

    customizedDeepmerge(x, y);

    expect({ ...x }).toStrictEqual(expected);
  });
});
