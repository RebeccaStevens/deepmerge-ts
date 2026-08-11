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
const SAMPLES_PER_SHAPE = 20;

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
  addBenchTask(benchAll, "deepmerge-ts (into)", samplesAll, (s) => {
    deepmergeInto({}, ...s);
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
  console.table(benchAll.table());

  // --- 2. Pairwise (2-arg) benchmark ---
  console.log(`\n--- Pairwise Merging (2-arg) ---`);
  const bench2Arg = createBench();

  addBenchTask(bench2Arg, "deepmerge-ts", samples2Arg, (s) => {
    deepmergeTs(s[0], s[1]);
  });
  addBenchTask(bench2Arg, "deepmerge-ts (into)", samples2Arg, (s) => {
    deepmergeInto({}, s[0], s[1]);
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
