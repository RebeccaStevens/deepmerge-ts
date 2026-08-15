import { deepmerge, deepmergeCustom } from "../../../src/index.ts";

const customMerge = deepmergeCustom({
  mergeArrays: (values) => values.flat(),
  mergeOthers: (values) => values.at(-1),
  filterValues: (values) => values.filter((value) => value !== undefined),
});

const defaultCustomMerge = deepmergeCustom({});
const mapMerge = deepmergeCustom({
  mergeMaps: (values) => new Map(values.flatMap((map) => [...map.entries()])),
  mergeSets: (values) => new Set(values.flatMap((set) => [...set])),
});

const itemA = { list: [1, 2], value: "a" as string | undefined, map: new Map<string, number>([["a", 1]]) };
const itemB = { list: [3], value: "b" as string | undefined, map: new Map<string, number>([["b", 2]]) };
const itemC = { set: new Set([1]), nested: { list: [7, 8] } };
const itemD = { set: new Set([2]), nested: { list: [9] } };

const cu01 = customMerge(itemA, itemB);
const cu02 = customMerge(itemA, itemB, itemA);
const cu03 = defaultCustomMerge(itemA, itemB);
const cu04 = mapMerge(itemC, itemD);
const cu05 = mapMerge({ map: new Map([["x", 1]]) }, { map: new Map([["y", 2]]) });
const cu06 = deepmerge(itemA, itemB);

export { cu01, cu02, cu03, cu04, cu05, cu06 };
