/* eslint-disable no-await-in-loop */
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import fastify from "@fastify/deepmerge";
import deepmerge from "deepmerge";
import { deepmerge as deepmergeTs } from "deepmerge-ts";
import defu from "defu";
import lodash from "lodash";
import { merge as mergeAnything } from "merge-anything";
import { mergician } from "mergician";
import { Accumulator as ObjectAccumulator } from "object-accumulator";
import { Bench } from "tinybench";
import { merge as tsDeepmerge } from "ts-deepmerge";

const benchmarkDataFile = path.join(dirname(fileURLToPath(import.meta.url)), "data.json");

// Number of independent dataset samples per shape — averaged to reduce noise.
const SAMPLES_PER_SHAPE = 5;

const benchmarkDataSets: Array<{
  name: string;
  samples: object[][];
}> = await fsp
  .access(benchmarkDataFile, fs.constants.R_OK)
  .then(async () => {
    console.log("Loading benchmark data file.");
    const raw = await fsp.readFile(benchmarkDataFile, { encoding: "utf8" });
    return JSON.parse(raw);
  })
  .catch(async (error: unknown) => {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") {
      throw error;
    }
    console.log("No benchmark data file found. Generating random data for benchmarking.");

    const data = [
      generateBenchmarkDataSet("tall", 2, 3, 16),
      generateBenchmarkDataSet("wide", 100, 12, 4),
      generateBenchmarkDataSet("mid", 10, 6, 8),
    ];

    await fsp.writeFile(benchmarkDataFile, JSON.stringify(data), { encoding: "utf8" });
    return data;
  });

let mut_sampleIndex = 0;
const nextSample = (samples: object[][]) => {
  const sample = samples[mut_sampleIndex % samples.length];
  mut_sampleIndex++;
  return sample;
};

for (let mut_i = 0; mut_i < benchmarkDataSets.length; mut_i++) {
  const { name: benchmarkName, samples } = benchmarkDataSets[mut_i];

  const bench = new Bench({
    time: 10_000,
    iterations: 1,
    warmupTime: 1000,
    warmupIterations: 1,
  });

  console.log(`\nRunning benchmarks for data set "${benchmarkName}" (${mut_i + 1} of ${benchmarkDataSets.length}):\n`);

  // Reset sample index for each dataset.
  mut_sampleIndex = 0;

  bench
    .add("deepmerge-ts", () => {
      deepmergeTs(...nextSample(samples));
    })
    .add("deepmerge", () => {
      deepmerge.all(nextSample(samples));
    })
    .add("defu", () => {
      defu({}, ...nextSample(samples));
    })
    .add("merge-anything", () => {
      (mergeAnything as any)(...nextSample(samples));
    })
    .add("object-accumulator", () => {
      ObjectAccumulator.from(nextSample(samples)).merge();
    })
    .add("lodash.merge", () => {
      lodash.merge({}, nextSample(samples));
    })
    .add("@fastify/deepmerge", () => {
      fastify({ all: true })(...nextSample(samples));
    })
    .add("mergician", () => {
      mergician(...nextSample(samples));
    })
    .add("ts-deepmerge", () => {
      tsDeepmerge(...nextSample(samples));
    });

  await bench.run();

  console.table(bench.table());
}

/**
 * Generate a named benchmark dataset with multiple independent samples.
 *
 * @param name - Dataset name.
 * @param items - Number of objects per merge call.
 * @param maxProperties - Max properties per object node.
 * @param maxDepth - Max nesting depth.
 */
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

/**
 * Generate a single benchmark data item with mixed-type values:
 * strings, numbers, booleans, arrays, and nested objects.
 *
 * @param maxProperties - Max properties per object node.
 * @param depth - Max nesting depth.
 * @param currentDepth - Current recursion depth.
 */
function generateBenchmarkDataItem(maxProperties: number, depth: number, currentDepth = 0): object {
  const obj: Record<string, unknown> = {};

  const properties = Math.floor(maxProperties * Math.random()) + 1;
  const keys = shuffle(Array.from({ length: maxProperties }, (_, i) => String.fromCodePoint(i + 65)));

  for (let mut_i = 0; mut_i < properties; mut_i++) {
    const key = keys[mut_i];

    if (currentDepth < depth) {
      // Randomly mix nested objects with other types.
      const roll = Math.random();
      if (roll < 0.6) {
        obj[key] = generateBenchmarkDataItem(maxProperties, depth, currentDepth + 1);
      } else if (roll < 0.75) {
        obj[key] = generateArrayValue(maxProperties, depth, currentDepth + 1);
      } else {
        obj[key] = generateScalar();
      }
    } else {
      // Leaf nodes: mix scalars and small arrays.
      obj[key] = Math.random() < 0.7 ? generateScalar() : generateLeafArray();
    }
  }

  return obj;
}

/** Generate a random scalar value (string, number, or boolean). */
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

/** Generate a small array of scalars for leaf nodes. */
function generateLeafArray(): unknown[] {
  const length = Math.floor(Math.random() * 4) + 1;
  return Array.from({ length }, generateScalar);
}

/** Generate an array that may contain nested objects or scalars. */
function generateArrayValue(maxProperties: number, depth: number, currentDepth: number): unknown[] {
  const length = Math.floor(Math.random() * 4) + 1;
  return Array.from({ length }, () =>
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
