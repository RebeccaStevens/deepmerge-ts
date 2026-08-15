/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-await-in-loop */
import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import fastify from "@fastify/deepmerge";
import deepmerge from "deepmerge";
import { deepmergeInto, deepmerge as deepmergeTs } from "deepmerge-ts";
import defu from "defu";
import lodash from "lodash";
import { merge as mergeAnything } from "merge-anything";
import { mergician } from "mergician";
import { Bench } from "tinybench";
import { merge as tsDeepmerge } from "ts-deepmerge";

const benchmarkDataFile = path.join(dirname(fileURLToPath(import.meta.url)), "data.json");
const SAMPLES_PER_SHAPE = 20;
const DATA_FORMAT_VERSION = 3;
const SEED = 0xde_ca_fb_ad;
const MARKER_KEY = "$deepmergeTsBenchmark";

const KEY_POOL = [
  "name",
  "host",
  "port",
  "retries",
  "timeout",
  "enabled",
  "level",
  "format",
  "url",
  "method",
  "headers",
  "body",
  "count",
  "limit",
  "offset",
  "config",
  "options",
  "settings",
  "metadata",
  "data",
  "items",
  "result",
  "status",
  "labels",
  "tags",
  "values",
  "title",
  "version",
  "endpoint",
  "paths",
] as const;

type BenchmarkDataSet = { name: string; samples: object[][] };
type BenchmarkData = {
  version: number;
  all: BenchmarkDataSet[];
  twoArg: BenchmarkDataSet[];
  collections: BenchmarkDataSet;
};

async function loadOrGenerateData(): Promise<BenchmarkData> {
  try {
    const content = await fs.readFile(benchmarkDataFile, "utf8");
    const parsed = JSON.parse(content) as unknown;
    if (isValidData(parsed)) {
      return hydrateData(parsed);
    }
  } catch {
    // Generate fresh data if file missing or format invalid
  }

  console.log("Generating fresh benchmark data...");
  const data: BenchmarkData = generateData();
  await fs.writeFile(benchmarkDataFile, JSON.stringify(data), "utf8");
  return hydrateData(data);
}

function generateData(): BenchmarkData {
  const rng = createRng(SEED);
  return {
    version: DATA_FORMAT_VERSION,
    all: [
      generateBenchmarkDataSet("tall", 3, 3, 16, rng),
      generateBenchmarkDataSet("wide", 100, 12, 4, rng),
      generateBenchmarkDataSet("mid", 10, 6, 8, rng),
    ],
    twoArg: [
      generateBenchmarkDataSet("tall", 2, 3, 16, rng),
      generateBenchmarkDataSet("wide", 2, 12, 4, rng),
      generateBenchmarkDataSet("mid", 2, 6, 8, rng),
    ],
    collections: generateCollectionsDataSet("collections", 3, 6, 8, rng),
  };
}

function logSortedBenchTable(bench: Bench) {
  const getOps = (row: Record<string, unknown> | null) => {
    if (row === null) {
      return 0;
    }
    const name = typeof row["Task name"] === "string" ? row["Task name"] : "";
    const task = bench.tasks.find((t) => t.name === name);
    return task?.result.state === "completed" ? task.result.throughput.mean : 0;
  };

  const sortedTable = [...bench.table()].sort((a, b) => getOps(b) - getOps(a));
  const firstRowOps = getOps(sortedTable[0] ?? null);
  const maxOps = firstRowOps > 0 ? firstRowOps : 1;

  // Gather standard column headers from completed rows
  const headerKeys = new Set<string>();
  for (const row of sortedTable) {
    if (row !== null) {
      for (const key of Object.keys(row)) {
        if (key !== "Error" && key !== "Stack") {
          headerKeys.add(key);
        }
      }
    }
  }

  const formattedTable: Array<Record<string, string>> = [];
  for (const [index, row] of sortedTable.entries()) {
    if (row === null) {
      continue;
    }
    const ops = getOps(row);
    const safeOps = ops === 0 ? 1 : ops;
    const ratio = maxOps / safeOps;
    const rank = index + 1;
    const rankStr = rank === 1 ? "1st (fastest)" : rank === 2 ? "2nd" : rank === 3 ? "3rd" : `${rank}th`;

    const rowObj: Record<string, string> = {
      Rank: rankStr,
      "Relative speed": index === 0 ? "1.00x" : ops === 0 ? "N/A" : `${ratio.toFixed(2)}x slower`,
    };

    for (const key of headerKeys) {
      rowObj[key] = key in row ? String(row[key] ?? "") : "N/A";
    }
    formattedTable.push(rowObj);
  }

  console.table(formattedTable);
}

/**
 * Deterministic pseudo-random number generator (mulberry32).
 *
 * @param seed - The seed.
 * @returns a function returning a number in the range [0, 1).
 */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

// Sets, Maps and Dates are not JSON-serializable, so the generated data is
// stored with marker objects and hydrated into real instances on load. This
// keeps data.json plain JSON while still exercising the Set/Map merge paths.
type SetMarker = { $deepmergeTsBenchmark: "set"; values: unknown[] };
type MapMarker = { $deepmergeTsBenchmark: "map"; entries: Array<[string, unknown]> };
type DateMarker = { $deepmergeTsBenchmark: "date"; iso: string };

const isMarker = (value: unknown): value is SetMarker | MapMarker | DateMarker =>
  typeof value === "object" && value !== null && MARKER_KEY in value;

function hydrateValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(hydrateValue);
  }
  if (isMarker(value)) {
    if (value[MARKER_KEY] === "set") {
      return new Set(value.values.map(hydrateValue));
    }
    if (value[MARKER_KEY] === "map") {
      return new Map(value.entries.map(([key, entryValue]) => [key, hydrateValue(entryValue)]));
    }
    return new Date(value.iso);
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [key, hydrateValue(entryValue)]));
  }
  return value;
}

const hydrateSet = (set: BenchmarkDataSet): BenchmarkDataSet => ({
  ...set,
  samples: set.samples.map((sample) => sample.map(hydrateValue) as object[]),
});

function hydrateData(data: BenchmarkData): BenchmarkData {
  return {
    ...data,
    all: data.all.map(hydrateSet),
    twoArg: data.twoArg.map(hydrateSet),
    collections: hydrateSet(data.collections),
  };
}

function isValidData(parsed: unknown): parsed is BenchmarkData {
  return (
    typeof parsed === "object" &&
    parsed !== null &&
    "version" in parsed &&
    parsed.version === DATA_FORMAT_VERSION &&
    "all" in parsed &&
    "twoArg" in parsed &&
    "collections" in parsed
  );
}

function generateBenchmarkDataSet(
  name: string,
  items: number,
  maxProperties: number,
  maxDepth: number,
  rng: () => number,
): BenchmarkDataSet {
  const samples: object[][] = [];
  for (let mut_s = 0; mut_s < SAMPLES_PER_SHAPE; mut_s++) {
    const sample: object[] = [];
    for (let mut_i = 0; mut_i < items; mut_i++) {
      sample.push(generateBenchmarkDataItem(maxProperties, maxDepth, 0, rng));
    }
    samples.push(sample);
  }
  return { name, samples };
}

function generateBenchmarkDataItem(
  maxProperties: number,
  depth: number,
  currentDepth: number,
  rng: () => number,
): object {
  const obj: Record<string, unknown> = {};
  const properties = Math.floor(maxProperties * rng()) + 1;
  const keys = shuffle([...KEY_POOL], rng).slice(0, properties);

  for (const key_ of keys) {
    const key = key_;
    if (currentDepth < depth) {
      const roll = rng();
      if (roll < 0.6) {
        obj[key] = generateBenchmarkDataItem(maxProperties, depth, currentDepth + 1, rng);
      } else if (roll < 0.85) {
        obj[key] = generateArrayValue(maxProperties, depth, currentDepth + 1, rng);
      } else {
        obj[key] = generateScalar(rng);
      }
    } else {
      const roll = rng();
      if (roll < 0.65) {
        obj[key] = generateScalar(rng);
      } else if (roll < 0.85) {
        obj[key] = generateLeafArray(rng);
      } else {
        obj[key] = generateArrayValue(maxProperties, depth, currentDepth + 1, rng);
      }
    }
  }
  return obj;
}

/**
 * A dataset packed with Set/Map/Date values. These types are only genuinely
 * deep-merged by deepmerge-ts, so this dataset is benched separately against a
 * small set of libraries rather than polluting the shared plain-object data.
 */
function generateCollectionsDataSet(
  name: string,
  items: number,
  maxProperties: number,
  maxDepth: number,
  rng: () => number,
): BenchmarkDataSet {
  const samples: object[][] = [];
  for (let mut_s = 0; mut_s < SAMPLES_PER_SHAPE; mut_s++) {
    const sample: object[] = [];
    for (let mut_i = 0; mut_i < items; mut_i++) {
      sample.push(generateCollectionsItem(maxProperties, maxDepth, 0, rng));
    }
    samples.push(sample);
  }
  return { name, samples };
}

function generateCollectionsItem(
  maxProperties: number,
  depth: number,
  currentDepth: number,
  rng: () => number,
): object {
  const obj: Record<string, unknown> = {};
  const properties = Math.floor(maxProperties * rng()) + 1;
  const keys = shuffle([...KEY_POOL], rng).slice(0, properties);

  for (const key_ of keys) {
    const key = key_;
    const roll = rng();
    if (roll < 0.2 && currentDepth < depth) {
      obj[key] = generateCollectionsItem(maxProperties, depth, currentDepth + 1, rng);
    } else if (roll < 0.4 && currentDepth < depth) {
      obj[key] = generateCollectionsArray(maxProperties, depth, currentDepth + 1, rng);
    } else if (roll < 0.55) {
      obj[key] = generateSetMarker(rng);
    } else if (roll < 0.7) {
      obj[key] = generateMapMarker(rng);
    } else if (roll < 0.85) {
      obj[key] = generateDateMarker(rng);
    } else {
      obj[key] = generateScalar(rng);
    }
  }
  return obj;
}

function generateCollectionsArray(
  maxProperties: number,
  depth: number,
  currentDepth: number,
  rng: () => number,
): unknown[] {
  return Array.from({ length: Math.floor(rng() * 3) + 1 }, () => {
    const roll = rng();
    if (roll < 0.4 && currentDepth < depth) {
      return generateCollectionsItem(maxProperties, depth, currentDepth + 1, rng);
    }
    if (roll < 0.55) {
      return generateSetMarker(rng);
    }
    if (roll < 0.7) {
      return generateMapMarker(rng);
    }
    if (roll < 0.85) {
      return generateDateMarker(rng);
    }
    return generateScalar(rng);
  });
}

function generateScalar(rng: () => number): string | number | boolean {
  const roll = rng();
  if (roll < 0.5) {
    return Math.floor(rng() * 1_000_000).toString(36);
  }
  if (roll < 0.8) {
    return Math.floor(rng() * 1_000_000);
  }
  return rng() < 0.5;
}

function generateLeafArray(rng: () => number): unknown[] {
  return Array.from({ length: Math.floor(rng() * 4) + 1 }, () => generateScalar(rng));
}

function generateArrayValue(maxProperties: number, depth: number, currentDepth: number, rng: () => number): unknown[] {
  return Array.from({ length: Math.floor(rng() * 4) + 1 }, () =>
    rng() < 0.5 && currentDepth < depth
      ? generateBenchmarkDataItem(maxProperties, depth, currentDepth + 1, rng)
      : generateScalar(rng),
  );
}

function generateSetMarker(rng: () => number): SetMarker {
  const size = Math.floor(rng() * 4) + 1;
  return { [MARKER_KEY]: "set", values: Array.from({ length: size }, () => generateScalar(rng)) };
}

function generateMapMarker(rng: () => number): MapMarker {
  const size = Math.floor(rng() * 3) + 1;
  const entries: Array<[string, unknown]> = [];
  for (let mut_i = 0; mut_i < size; mut_i++) {
    entries.push([`${generateScalar(rng)}-${mut_i}`, generateScalar(rng)]);
  }
  return { [MARKER_KEY]: "map", entries };
}

function generateDateMarker(rng: () => number): DateMarker {
  return { [MARKER_KEY]: "date", iso: new Date(1_500_000_000_000 + Math.floor(rng() * 1e11)).toISOString() };
}

function shuffle<T>(array: T[], rng: () => number): T[] {
  let mut_currentIndex = array.length;
  while (mut_currentIndex !== 0) {
    const mut_randomIndex = Math.floor(rng() * mut_currentIndex);
    mut_currentIndex--;
    [array[mut_currentIndex], array[mut_randomIndex]] = [array[mut_randomIndex], array[mut_currentIndex]];
  }
  return array;
}

const benchmarkData = await loadOrGenerateData();

const fastifyMergeAll = fastify({ all: true });
const fastifyMerge2 = fastify();

const createBench = () =>
  new Bench({
    time: 3000,
    iterations: 1,
    warmupTime: 500,
    warmupIterations: 1,
  });

const addBenchTask = (bench: Bench, name: string, samples: object[][], fn: (sample: object[]) => void) => {
  let mut_sampleIndex = 0;
  bench.add(name, () => {
    fn(samples[mut_sampleIndex++ % samples.length]);
  });
};

for (let mut_i = 0; mut_i < benchmarkData.all.length; mut_i++) {
  const { name: benchmarkName, samples: samplesAll } = benchmarkData.all[mut_i];
  const { samples: samples2Arg } = benchmarkData.twoArg[mut_i];

  console.log(`\n==================================================`);
  console.log(`Dataset "${benchmarkName}" (${mut_i + 1}/${benchmarkData.all.length})`);
  console.log(`==================================================\n`);

  // --- 1. Multi-object (all) benchmark ---
  console.log(`--- Multi-object / Variadic Merging (all) ---`);
  const benchAll = createBench();

  addBenchTask(benchAll, "deepmerge-ts", samplesAll, (s) => {
    deepmergeTs(...s);
  });
  // deepmergeInto is not a pure function (it mutates nested objects in-place).
  // Use structuredClone to prevent corrupting the shared benchmark dataset across iterations.
  addBenchTask(benchAll, "deepmerge-ts (into)", samplesAll, (s) => {
    deepmergeInto({}, ...structuredClone(s));
  });
  addBenchTask(benchAll, "lodash.merge", samplesAll, (s) => {
    lodash.merge({}, ...s);
  });
  addBenchTask(benchAll, "deepmerge", samplesAll, (s) => {
    deepmerge.all(s);
  });
  addBenchTask(benchAll, "defu", samplesAll, (s) => {
    (defu as any)(...s);
  });
  addBenchTask(benchAll, "@fastify/deepmerge", samplesAll, (s) => {
    fastifyMergeAll(...s);
  });
  addBenchTask(benchAll, "ts-deepmerge", samplesAll, (s) => {
    tsDeepmerge(...s);
  });
  addBenchTask(benchAll, "merge-anything", samplesAll, (s) => {
    (mergeAnything as any)(...s);
  });
  addBenchTask(benchAll, "mergician", samplesAll, (s) => {
    mergician(...s);
  });

  await benchAll.run();
  logSortedBenchTable(benchAll);

  // --- 2. Pairwise (2-arg) benchmark ---
  console.log(`\n--- Pairwise Merging (2-arg) ---`);
  const bench2Arg = createBench();

  addBenchTask(bench2Arg, "deepmerge-ts", samples2Arg, (s) => {
    deepmergeTs(s[0], s[1]);
  });
  // deepmergeInto is not a pure function (it mutates nested objects in-place).
  // Use structuredClone to prevent corrupting the shared benchmark dataset across iterations.
  addBenchTask(bench2Arg, "deepmerge-ts (into)", samples2Arg, (s) => {
    const [a, b] = structuredClone(s);
    deepmergeInto({}, a, b);
  });
  addBenchTask(bench2Arg, "lodash.merge", samples2Arg, (s) => {
    lodash.merge({}, s[0], s[1]);
  });
  addBenchTask(bench2Arg, "deepmerge", samples2Arg, (s) => {
    deepmerge(s[0], s[1]);
  });
  addBenchTask(bench2Arg, "defu", samples2Arg, (s) => {
    (defu as any)(s[0], s[1]);
  });
  addBenchTask(bench2Arg, "@fastify/deepmerge", samples2Arg, (s) => {
    fastifyMerge2(s[0], s[1]);
  });
  addBenchTask(bench2Arg, "ts-deepmerge", samples2Arg, (s) => {
    tsDeepmerge(s[0], s[1]);
  });
  addBenchTask(bench2Arg, "merge-anything", samples2Arg, (s) => {
    (mergeAnything as any)(s[0], s[1]);
  });
  addBenchTask(bench2Arg, "mergician", samples2Arg, (s) => {
    mergician(s[0], s[1]);
  });

  await bench2Arg.run();
  logSortedBenchTable(bench2Arg);
}

// --- 3. Collections benchmark (Set/Map/Date) ---
const { collections } = benchmarkData;
console.log(`\n==================================================`);
console.log(`Dataset "${collections.name}" — Set/Map/Date values`);
console.log(`==================================================\n`);

console.log(`--- Multi-object / Variadic Merging (all) ---`);
const benchCollections = createBench();

addBenchTask(benchCollections, "deepmerge-ts", collections.samples, (s) => {
  deepmergeTs(...s);
});
// deepmergeInto is not a pure function (it mutates nested objects in-place).
// Use structuredClone to prevent corrupting the shared benchmark dataset across iterations.
addBenchTask(benchCollections, "deepmerge-ts (into)", collections.samples, (s) => {
  deepmergeInto({}, ...structuredClone(s));
});
// @fastify/deepmerge and lodash.merge do not deep-merge Set/Map contents (they replace
// them wholesale). They are included as reference points that complete without errors.
addBenchTask(benchCollections, "@fastify/deepmerge", collections.samples, (s) => {
  fastifyMergeAll(...s);
});
addBenchTask(benchCollections, "lodash.merge", collections.samples, (s) => {
  lodash.merge({}, ...s);
});

await benchCollections.run();
logSortedBenchTable(benchCollections);
