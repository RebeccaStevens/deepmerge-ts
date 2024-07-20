/* eslint-disable no-await-in-loop */
import * as fs from "node:fs";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import deepmerge from "deepmerge";
import { deepmerge as deepmergeTs } from "deepmerge-ts";
import { defu } from "defu";
import lodash from "lodash";
import { merge as mergeAnything } from "merge-anything";
import { Accumulator as ObjectAccumulator } from "object-accumulator";
import { Bench } from "tinybench";

const benchmarkDataFile = path.join(
  dirname(fileURLToPath(import.meta.url)),
  "data.json",
);

const benchmarkDataSets: Array<{
  name: string;
  data: object[];
}> = await fsp
  .access(benchmarkDataFile, fs.constants.R_OK)
  .then(async () => {
    console.log("Loading benchmark data file.");
    const data = await fsp.readFile(benchmarkDataFile, { encoding: "utf8" });
    return JSON.parse(data);
  })
  .catch(async (error: unknown) => {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      error.code !== "ENOENT"
    ) {
      throw error;
    }
    console.log(
      "No benchmark data file found. Generating random data for benchmarking against.",
    );

    const data = [
      generateBenchmarkDataSet("tall", 2, 3, 16),
      generateBenchmarkDataSet("wide", 100, 12, 4),
      generateBenchmarkDataSet("mid", 10, 6, 8),
    ];

    await fsp.writeFile(benchmarkDataFile, JSON.stringify(data), {
      encoding: "utf8",
    });

    return data;
  });

for (let m_i = 0; m_i < benchmarkDataSets.length; m_i++) {
  const { name: benchmarkName, data: benchmarkData } = benchmarkDataSets[m_i];
  const bench = new Bench({
    time: 10_000,
    iterations: 1,
    warmupTime: 1000,
    warmupIterations: 1,
  });

  console.log(
    `\nRunning benchmarks for data set "${benchmarkName}" (${m_i + 1} of ${
      benchmarkDataSets.length
    }):\n`,
  );

  bench
    .add("deepmerge-ts", () => {
      deepmergeTs(...benchmarkData);
    })
    .add("deepmerge", () => {
      deepmerge.all(benchmarkData);
    })
    .add("defu", () => {
      defu(benchmarkData);
    })
    .add("merge-anything", () => {
      (mergeAnything as any)(...benchmarkData);
    })
    .add("object-accumulator", () => {
      ObjectAccumulator.from(benchmarkData).merge();
    })
    .add("lodash merge", () => {
      lodash.merge({}, benchmarkData);
    });

  await bench.warmup();
  await bench.run();

  console.table(bench.table());
}

function generateBenchmarkDataSet(
  name: string,
  items: number,
  maxProperties: number,
  maxDepth: number,
) {
  const data: object[] = [];

  for (let m_i = 0; m_i < items; m_i++) {
    data.push(generateBenchmarkDataItem(maxProperties, maxDepth));
  }

  return {
    name,
    data,
  };
}

function generateBenchmarkDataItem(
  maxProperties: number,
  depth: number,
  currentDepth = 0,
) {
  const obj: object = {};

  const properties = Math.floor(maxProperties * Math.random()) + 1;

  const propertiesOptions = shuffle(
    Array.from({ length: maxProperties }, (_, i) =>
      String.fromCodePoint(i + 65),
    ),
  );

  for (let m_i = 0; m_i < properties; m_i++) {
    const prop = propertiesOptions[m_i];

    obj[prop] =
      currentDepth < depth
        ? generateBenchmarkDataItem(maxProperties, depth, currentDepth + 1)
        : "value";
  }

  return obj;
}

function shuffle<T>(array: T[]) {
  let m_currentIndex = array.length;
  let m_randomIndex;

  while (m_currentIndex !== 0) {
    m_randomIndex = Math.floor(Math.random() * m_currentIndex);
    m_currentIndex--;

    [array[m_currentIndex], array[m_randomIndex]] = [
      array[m_randomIndex],
      array[m_currentIndex],
    ];
  }

  return array;
}
