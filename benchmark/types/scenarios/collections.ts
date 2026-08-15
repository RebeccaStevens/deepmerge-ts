import { deepmerge } from "../../../src/index.ts";

const tupleA = [1, "a", true] as const;
const tupleB = [2, "b", false] as const;
const roTupleA: readonly [number, string] = [1, "a"];
const roTupleB: readonly [number, string] = [2, "b"];
const arrayA: number[] = [1, 2, 3];
const arrayB: ReadonlyArray<number> = [4, 5];
const setA = new Set([1, 2, 3]);
const setB = new Set([4, 5]);
const mapA = new Map<string, number>([
  ["a", 1],
  ["b", 2],
]);
const mapB = new Map<string, number>([["c", 3]]);
const dateA = new Date("2020-01-01T00:00:00Z");
const dateB = new Date("2021-01-01T00:00:00Z");
const nestedSet = new Set([new Set([1]), new Set([2])]);
const nestedMap = new Map<string, Map<string, number>>([["x", new Map([["y", 1]])]]);

const c01 = deepmerge(tupleA, tupleB);
const c02 = deepmerge(roTupleA, roTupleB);
const c03 = deepmerge(arrayA, arrayB);
const c04 = deepmerge(setA, setB);
const c05 = deepmerge(mapA, mapB);
const c06 = deepmerge(dateA, dateB);
const c07 = deepmerge(nestedSet, nestedSet);
const c08 = deepmerge(nestedMap, new Map([["x", new Map([["z", 2]])]]));
const c09 = deepmerge(
  { tuple: tupleA, array: arrayA, set: setA, map: mapA, date: dateA },
  { tuple: tupleB, array: arrayB, set: setB, map: mapB, date: dateB },
);
const c10 = deepmerge([tupleA, arrayA], [tupleB]);
const c11 = deepmerge({ list: [1, 2] }, { list: [3] }, { list: [4, 5] });

export { c01, c02, c03, c04, c05, c06, c07, c08, c09, c10, c11 };
