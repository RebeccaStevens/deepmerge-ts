import { deepmergeInto, deepmergeIntoCustom } from "../../../src/index.ts";

type Target = {
  server?: { host?: string; port?: number; tls?: boolean };
  list?: number[];
  set?: Set<number>;
  map?: Map<string, number>;
  flags?: Record<string, boolean>;
  meta?: { created?: string; nested?: { count?: number } };
};

const target01: Target = {};
deepmergeInto(target01, { server: { host: "a", port: 80 } }, { server: { tls: true } });

const target02: Target = { server: { host: "b" }, list: [1, 2] };
deepmergeInto(target02, { list: [3] }, { flags: { x: true } });

const target03: Target = {};
deepmergeInto(
  target03,
  { server: { host: "c", port: 443 } },
  { meta: { created: "2026-01-01", nested: { count: 1 } } },
  { map: new Map([["a", 1]]) },
  { set: new Set([1, 2]) },
);

const target04: Target = {};
deepmergeInto(target04, { server: { host: "d" } });
deepmergeInto(target04, { server: { port: 9090 } }, { flags: { y: false } });

const intoCustom = deepmergeIntoCustom({ mergeArrays: false, filterValues: false });
const target05: Target = {};
intoCustom(target05, { list: [1, 2] }, { list: [3] });

export { target01, target02, target03, target04, target05 };
