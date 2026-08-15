/* eslint-disable node/no-unpublished-import */
/* eslint-disable no-await-in-loop */
import fastify from "@fastify/deepmerge";
import deepmerge from "deepmerge";
import { deepmergeInto, deepmerge as deepmergeTs } from "deepmerge-ts";
import defu from "defu";
import lodash from "lodash";
import { merge as mergeAnything } from "merge-anything";
import { mergician } from "mergician";
import { Bench } from "tinybench";
import { merge as tsDeepmerge } from "ts-deepmerge";

import { loadOrGenerateData } from "./data.ts";

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
