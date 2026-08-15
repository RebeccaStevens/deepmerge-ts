import { deepmerge } from "../../../src/index.ts";

const wideA = {
  k00: 0,
  k01: 1,
  k02: 2,
  k03: 3,
  k04: 4,
  k05: 5,
  k06: 6,
  k07: 7,
  k08: 8,
  k09: 9,
  k10: 10,
  k11: 11,
  k12: 12,
  k13: 13,
  k14: 14,
  k15: 15,
  k16: 16,
  k17: 17,
  k18: 18,
  k19: 19,
  nested: { a: { b: { c: { d: { e: 1 } } } } },
  list: [1, 2, 3],
  set: new Set([1, 2, 3]),
  map: new Map<string, number>([["a", 1]]),
};

const wideB = {
  k00: "a",
  k01: "b",
  k02: "c",
  k03: "d",
  k04: "e",
  k05: "f",
  k06: "g",
  k07: "h",
  k08: "i",
  k09: "j",
  k10: "k",
  k11: "l",
  k12: "m",
  k13: "n",
  k14: "o",
  k15: "p",
  k16: "q",
  k17: "r",
  k18: "s",
  k19: "t",
  nested: { a: { b: { c: { d: { f: 2 } } } } },
  list: [4, 5],
  set: new Set([4, 5]),
  map: new Map<string, number>([["b", 2]]),
};

const wideC = {
  k00: true,
  k01: false,
  k02: true,
  k03: false,
  k04: true,
  k05: false,
  k06: true,
  k07: false,
  k08: true,
  k09: false,
  k10: true,
  k11: false,
  k12: true,
  k13: false,
  k14: true,
  k15: false,
  k16: true,
  k17: false,
  k18: true,
  k19: false,
  nested: { a: { b: { c: { g: 3 } } } },
  list: [6],
  set: new Set([6]),
  map: new Map<string, number>([["c", 3]]),
};

const r01 = deepmerge(wideA, wideB);
const r02 = deepmerge(wideB, wideC);
const r03 = deepmerge(wideC, wideA);
const r04 = deepmerge(wideA, wideB, wideC);
const r05 = deepmerge(wideB, wideC, wideA);
const r06 = deepmerge(wideC, wideA, wideB);
const r07 = deepmerge(wideA, wideB, wideA, wideB);
const r08 = deepmerge(wideB, wideC, wideB, wideC);
const r09 = deepmerge(wideC, wideA, wideC, wideA);
const r10 = deepmerge(wideA, wideC, wideB, wideA, wideB, wideC);
const r11 = deepmerge(wideB, wideA, wideC, wideB, wideA, wideC);
const r12 = deepmerge(wideC, wideB, wideA, wideC, wideB, wideA);
const r13 = deepmerge(wideA, wideB, wideC, wideA, wideB, wideC);
const r14 = deepmerge(wideB, wideC, wideA, wideB, wideC, wideA);
const r15 = deepmerge(wideC, wideA, wideB, wideC, wideA, wideB);

export { r01, r02, r03, r04, r05, r06, r07, r08, r09, r10, r11, r12, r13, r14, r15 };
