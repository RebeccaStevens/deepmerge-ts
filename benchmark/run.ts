import Benchmark from "benchmark";

import { deepmerge as deepmergeTs } from "deepmerge-ts";
import { all as deepmerge } from "deepmerge";
import { merge as mergeAnything } from "merge-anything";
import { Accumulator as ObjectAccumulator } from "object-accumulator";
import { merge as lodashMerge } from "lodash";

console.log("Generating benchmark data.");

const benchmarkData = generateBenchmarkDataArray(100, 10, 4);

console.log("Running benchmarks.");

const suite = new Benchmark.Suite();

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

    console.log(`\nFastest is ${results.filter("fastest").map("name")}`);
  })
  .run({ async: true });

function generateBenchmarkDataArray(items, maxProperties, maxDepth) {
  const data: object[] = [];

  for (let i = 0; i < items; i++) {
    data.push(generateBenchmarkDataItem(maxProperties, maxDepth));
  }

  return data;
}

function generateBenchmarkDataItem(maxProperties, depth, currentDepth = 0) {
  const obj = {};

  const properties = Math.floor(maxProperties * Math.random()) + 1;

  const propertiesOptions = shuffle(
    Array.from({ length: maxProperties }, (_, i) => String.fromCharCode(i + 65))
  );

  for (let i = 0; i < properties; i++) {
    const prop = propertiesOptions[i];

    obj[prop] =
      currentDepth < depth
        ? generateBenchmarkDataItem(maxProperties, depth, currentDepth + 1)
        : "value";
  }

  return obj;
}

function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
