import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

export async function loadOrGenerateData(): Promise<BenchmarkData> {
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

const hydrateSet = (set: Readonly<BenchmarkDataSet>): BenchmarkDataSet => ({
  ...set,
  samples: set.samples.map((sample) => sample.map(hydrateValue) as object[]),
});

function hydrateData(data: Readonly<BenchmarkData>): BenchmarkData {
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
