/* eslint-disable no-await-in-loop */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { dirname } from "node:path";
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
const SAMPLES_PER_SHAPE = 5;

type BenchmarkDataSet = { name: string; samples: object[][] };

type BenchmarkData = {
  all: BenchmarkDataSet[];
  twoArg: BenchmarkDataSet[];
};

const benchmarkData: BenchmarkData = await fs
  .readFile(benchmarkDataFile, "utf8")
  .then((data) => {
    const parsed = JSON.parse(data) as unknown;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      !("all" in parsed) ||
      !("twoArg" in parsed)
    ) {
      throw new Error("Invalid benchmark data format");
    }
    return parsed as BenchmarkData;
  })
  .catch(async () => {
    console.log("Generating fresh benchmark data...");
    const data: BenchmarkData = {
      all: [
        generateBenchmarkDataSet("tall", 3, 3, 16),
        generateBenchmarkDataSet("wide", 100, 12, 4),
        generateBenchmarkDataSet("mid", 10, 6, 8),
      ],
      twoArg: [
        generateBenchmarkDataSet("tall", 2, 3, 16),
        generateBenchmarkDataSet("wide", 2, 12, 4),
        generateBenchmarkDataSet("mid", 2, 6, 8),
      ],
    };
    await fs.writeFile(benchmarkDataFile, JSON.stringify(data), "utf8");
    return data;
  });

let mut_sampleIndex = 0;
const nextSample = (samples: object[][]) => samples[mut_sampleIndex++ % samples.length];

const fastifyMergeAll = fastify({ all: true });
const fastifyMerge2 = fastify();

const createBench = () =>
  new Bench({
    time: 10_000,
    iterations: 1,
    warmupTime: 1000,
    warmupIterations: 1,
  });

for (let mut_i = 0; mut_i < benchmarkData.all.length; mut_i++) {
  const { name: benchmarkName, samples: samplesAll } = benchmarkData.all[mut_i];
  const { samples: samples2Arg } = benchmarkData.twoArg[mut_i];

  console.log(`\n==================================================`);
  console.log(`Dataset "${benchmarkName}" (${mut_i + 1}/${benchmarkData.all.length})`);
  console.log(`==================================================\n`);

  // --- 1. Multi-object (all) benchmark ---
  console.log(`--- Multi-object / Variadic Merging (all) ---`);
  mut_sampleIndex = 0;
  const benchAll = createBench();

  benchAll
    .add("deepmerge-ts", () => {
      deepmergeTs(...nextSample(samplesAll));
    })
    .add("deepmerge-ts (into)", () => {
      deepmergeInto({}, ...nextSample(samplesAll));
    })
    .add("lodash.merge", () => {
      lodash.merge({}, ...nextSample(samplesAll));
    })
    .add("deepmerge", () => {
      deepmerge.all(nextSample(samplesAll));
    })
    .add("defu", () => {
      (defu as any)(...nextSample(samplesAll));
    })
    .add("@fastify/deepmerge", () => {
      fastifyMergeAll(...nextSample(samplesAll));
    })
    .add("ts-deepmerge", () => {
      tsDeepmerge(...nextSample(samplesAll));
    })
    .add("merge-anything", () => {
      (mergeAnything as any)(...nextSample(samplesAll));
    })
    .add("mergician", () => {
      mergician(...nextSample(samplesAll));
    });

  await benchAll.run();
  console.table(benchAll.table());

  // --- 2. Pairwise (2-arg) benchmark ---
  console.log(`\n--- Pairwise Merging (2-arg) ---`);
  mut_sampleIndex = 0;
  const bench2Arg = createBench();

  bench2Arg
    .add("deepmerge-ts", () => {
      const s = nextSample(samples2Arg);
      deepmergeTs(s[0], s[1]);
    })
    .add("deepmerge-ts (into)", () => {
      const s = nextSample(samples2Arg);
      deepmergeInto(s[0], s[1]);
    })
    .add("lodash.merge", () => {
      const s = nextSample(samples2Arg);
      lodash.merge({}, s[0], s[1]);
    })
    .add("deepmerge", () => {
      const s = nextSample(samples2Arg);
      deepmerge(s[0], s[1]);
    })
    .add("defu", () => {
      const s = nextSample(samples2Arg);
      (defu as any)(s[0], s[1]);
    })
    .add("@fastify/deepmerge", () => {
      const s = nextSample(samples2Arg);
      fastifyMerge2(s[0], s[1]);
    })
    .add("ts-deepmerge", () => {
      const s = nextSample(samples2Arg);
      tsDeepmerge(s[0], s[1]);
    })
    .add("merge-anything", () => {
      const s = nextSample(samples2Arg);
      (mergeAnything as any)(s[0], s[1]);
    })
    .add("mergician", () => {
      const s = nextSample(samples2Arg);
      mergician(s[0], s[1]);
    });

  await bench2Arg.run();
  console.table(bench2Arg.table());
}

function generateBenchmarkDataSet(name: string, items: number, maxProperties: number, maxDepth: number) {
  const samples: object[][] = [];
  for (let mut_s = 0; mut_s < SAMPLES_PER_SHAPE; mut_s++) {
    const sample: object[] = [];
    for (let mut_i = 0; mut_i < items; mut_i++) {
      sample.push(generateBenchmarkDataItem(maxProperties, maxDepth));
    }
    samples.push(sample);
  }
  return { name, samples };
}

function generateBenchmarkDataItem(maxProperties: number, depth: number, currentDepth = 0): object {
  const obj: Record<string, unknown> = {};
  const properties = Math.floor(maxProperties * Math.random()) + 1;
  const keys = shuffle(Array.from({ length: maxProperties }, (_, i) => String.fromCodePoint(i + 65)));

  for (let mut_i = 0; mut_i < properties; mut_i++) {
    const key = keys[mut_i];
    if (currentDepth < depth) {
      const roll = Math.random();
      if (roll < 0.6) {
        obj[key] = generateBenchmarkDataItem(maxProperties, depth, currentDepth + 1);
      } else if (roll < 0.75) {
        obj[key] = generateArrayValue(maxProperties, depth, currentDepth + 1);
      } else {
        obj[key] = generateScalar();
      }
    } else {
      obj[key] = Math.random() < 0.7 ? generateScalar() : generateLeafArray();
    }
  }
  return obj;
}

function generateScalar(): string | number | boolean {
  const roll = Math.random();
  if (roll < 0.5) {
    return Math.random().toString(36).slice(2);
  }
  if (roll < 0.8) {
    return Math.floor(Math.random() * 1_000_000);
  }
  return Math.random() < 0.5;
}

function generateLeafArray(): unknown[] {
  return Array.from({ length: Math.floor(Math.random() * 4) + 1 }, generateScalar);
}

function generateArrayValue(maxProperties: number, depth: number, currentDepth: number): unknown[] {
  return Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () =>
    Math.random() < 0.5 && currentDepth < depth
      ? generateBenchmarkDataItem(maxProperties, depth, currentDepth + 1)
      : generateScalar(),
  );
}

function shuffle<T>(array: T[]) {
  let mut_currentIndex = array.length;
  while (mut_currentIndex !== 0) {
    const mut_randomIndex = Math.floor(Math.random() * mut_currentIndex);
    mut_currentIndex--;
    [array[mut_currentIndex], array[mut_randomIndex]] = [array[mut_randomIndex], array[mut_currentIndex]];
  }
  return array;
}
