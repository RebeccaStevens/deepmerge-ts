import { deepmerge } from "../../../src/index.ts";

type Deep<L extends number, T, Acc extends unknown[] = []> = Acc["length"] extends L
  ? { leaf: T }
  : { left: Deep<L, T, [unknown, ...Acc]>; right: Deep<L, T, [unknown, ...Acc]>; leaf: T };

const deepA: Deep<7, { a: number }> = {} as Deep<7, { a: number }>;
const deepB: Deep<7, { b: string }> = {} as Deep<7, { b: string }>;
const deepC: Deep<7, { c: boolean }> = {} as Deep<7, { c: boolean }>;

const d01 = deepmerge(deepA, deepB);
const d02 = deepmerge(deepB, deepC);
const d03 = deepmerge(deepA, deepB, deepC);
const d04 = deepmerge(deepC, deepB, deepA);
const d05 = deepmerge(deepA, deepB, deepA, deepB);
const d06 = deepmerge(deepC, deepA, deepB, deepC, deepA, deepB);

export { d01, d02, d03, d04, d05, d06 };
