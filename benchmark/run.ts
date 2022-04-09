import Benchmark from "benchmark";

import { constants as fsConstants, promises as fs } from "node:fs";
import * as path from "node:path";

import { deepmerge as deepmergeTs } from "deepmerge-ts";
import { all as deepmerge } from "deepmerge";
import { merge as mergeAnything } from "merge-anything";
import { Accumulator as ObjectAccumulator } from "object-accumulator";
import { merge as lodashMerge } from "lodash";

const benchmarkDataFile = path.join(__dirname, "data.json");

void (async () => {
  const benchmarkDataSets: any[][] = await fs
    .access(benchmarkDataFile, fsConstants.R_OK)
    .then(async () => {
      console.log("Loading benchmark data file.");
      const data = await fs.readFile(benchmarkDataFile, { encoding: "utf8" });
      return JSON.parse(data);
    })
    .catch(async (error) => {
      if (error?.code !== "ENOENT") {
        throw error;
      }
      console.log("No benchmark data file found. Generating benchmark data.");

      const data = [
        generateBenchmarkDataArray(2, 4, 15),
        generateBenchmarkDataArray(100, 10, 4),
      ];

      await fs.writeFile(benchmarkDataFile, JSON.stringify(data), {
        encoding: "utf8",
      });

      return data;
    });

  for (let m_i = 0; m_i < benchmarkDataSets.length; m_i++) {
    const benchmarkData = benchmarkDataSets[m_i];
    const suite = new Benchmark.Suite();

    console.log(
      `\nRunning benchmarks for data set ${m_i + 1} of ${
        benchmarkDataSets.length
      }:\n`
    );

    // add tests
    suite
      .add("deepmerge-ts", () => {
        deepmergeTs(...benchmarkData);
      })
      .add("deepmerge", () => {
        deepmerge(benchmarkData);
      })
      .add("merge-anything", () => {
        (mergeAnything as any)(...benchmarkData);
      })
      .add("object-accumulator", () => {
        ObjectAccumulator.from(benchmarkData).merge();
      })
      .add("lowdash merge", () => {
        lodashMerge({}, benchmarkData);
      })
      .on("cycle", (event: any) => {
        console.log(String(event.target));
      })
      // eslint-disable-next-line func-names
      .on("complete", function () {
        // @ts-expect-error When need to access the "this" value
        // eslint-disable-next-line unicorn/no-this-assignment, @typescript-eslint/no-this-alias, no-invalid-this
        const results = this;

        console.log(
          `\nFastest is ${results.filter("fastest").map("name")} for data set ${
            m_i + 1
          } of ${benchmarkDataSets.length}`
        );
      })
      .run({ async: false });
  }
})();

function generateBenchmarkDataArray(items, maxProperties, maxDepth) {
  const data: object[] = [];

  for (let m_i = 0; m_i < items; m_i++) {
    data.push(generateBenchmarkDataItem(maxProperties, maxDepth));
  }

  return data;
}

function generateBenchmarkDataItem(maxProperties, depth, currentDepth = 0) {
  const obj = {};

  const properties = Math.floor(maxProperties * Math.random()) + 1;

  const propertiesOptions = shuffle(
    Array.from({ length: maxProperties }, (_, i) =>
      String.fromCodePoint(i + 65)
    )
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

function shuffle(array) {
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
