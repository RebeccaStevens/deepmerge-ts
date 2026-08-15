/**
 * Type-check performance benchmark.
 *
 * Runs `tsc --extendedDiagnostics` against each type stress scenario in
 * `benchmark/types/scenarios/` and logs the deterministic counters tsc emits
 * (Types, Instantiations, Symbols, Memory used, and timings).
 *
 * Each scenario is a self-contained program compiled in isolation so that a
 * regression can be attributed to the shape family it exercises (wide records,
 * deeply nested records, optional properties, collections, unions, the "into"
 * engine, and customized merge functions).
 *
 * When a baseline exists, each scenario's current run is compared against it
 * and any regressions are reported in the log output. Regressions never fail
 * the process — the output is meant to be referenced, not to gate CI. Only the
 * deterministic counters (not the timing metrics) are flagged as regressions.
 *
 * Usage:
 * node --strip-types scripts/benchmark-types.ts                  # run + compare vs baseline
 * node --strip-types scripts/benchmark-types.ts --update         # record a new baseline
 * node --strip-types scripts/benchmark-types.ts --runs 5         # custom number of runs
 * node --strip-types scripts/benchmark-types.ts --scenario wide  # run a single scenario
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const SCENARIOS_DIR = join(ROOT_DIR, "benchmark", "types", "scenarios");
const TSCONFIG_PATH = join(ROOT_DIR, "benchmark", "types", "tsconfig.json");
const BASELINE_PATH = join(ROOT_DIR, "benchmark", "types", "baseline.json");
// Generated per-scenario tsconfigs live inside the repo (not the OS temp dir) so
// that type library resolution (e.g. `types: ["node"]`) finds the repo's
// node_modules when walking up the directory tree. Git-ignored.
const GENERATED_CONFIG_DIR = join(ROOT_DIR, "benchmark", "types", ".generated");

const require = createRequire(import.meta.url);
const TSC_PATH = join(dirname(require.resolve("typescript/package.json")), "bin", "tsc");
const TYPESCRIPT_VERSION = require("typescript/package.json").version;

const UPDATE_BASELINE_FLAG = "--update";
const RUN_COUNT_FLAG = "--runs";
const SCENARIO_FLAG = "--scenario";
const DEFAULT_RUN_COUNT = 3;
const REGRESSION_THRESHOLD_PERCENT = 10;

// Only the compiler work counters (Types/Instantiations/Symbols) are reliable
// regression signals. "Memory used" and the timings are GC/noise influenced and
// are reported for reference only.
const COUNTER_NAMES = ["Types", "Instantiations", "Symbols"] as const;
const MEMORY_NAMES = ["Memory used"] as const;
const TIME_NAMES = ["Check time", "Total time"] as const;

type MetricName = (typeof COUNTER_NAMES)[number] | (typeof MEMORY_NAMES)[number] | (typeof TIME_NAMES)[number];
type Metrics = Record<MetricName, number>;

const ALL_METRICS: ReadonlyArray<MetricName> = [...COUNTER_NAMES, ...MEMORY_NAMES, ...TIME_NAMES];

type ScenarioMetrics = Record<string, Metrics>;

type Baseline = Readonly<{
  typescript: string;
  created: string;
  scenarios: ScenarioMetrics;
}>;

const LINE_PATTERN = /^(?<name>[\w ]+):\s+(?<value>[\d.]+)[Ks]?\s*$/u;

/** The median of a list of numbers. */
const median = (values: ReadonlyArray<number>): number => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  return sorted.length % 2 === 0 ? (sorted[middle - 1]! + sorted[middle]!) / 2 : sorted[middle]!;
};

/** Discover the benchmark scenario names, in alphabetical order. */
const getScenarioNames = (): string[] =>
  readdirSync(SCENARIOS_DIR)
    .filter((fileName) => fileName.endsWith(".ts"))
    .map((fileName) => fileName.replace(/\.ts$/u, ""))
    .sort();

/**
 * Parse the extended diagnostics output of a single tsc run.
 *
 * @throws {Error} when any expected metric is missing from the output.
 */
const parseDiagnostics = (output: string): Metrics => {
  const metrics = {} as Metrics;
  for (const line of output.split("\n")) {
    const match = LINE_PATTERN.exec(line);
    const name = match?.groups?.["name"];
    const value = match?.groups?.["value"];
    if (name === undefined || value === undefined) {
      continue;
    }
    if (!(ALL_METRICS as ReadonlyArray<string>).includes(name)) {
      continue;
    }
    metrics[name as MetricName] = Number(value);
  }
  const missing = ALL_METRICS.filter((name) => !(name in metrics));
  if (missing.length > 0) {
    throw new Error(`Failed to parse tsc extended diagnostics; missing: ${missing.join(", ")}`);
  }
  return metrics;
};

/**
 * Run tsc against a single scenario and return the emitted metrics.
 *
 * @param scenario - The scenario name (without the `.ts` extension).
 * @throws {Error} when tsc exits with a non-zero status or output can't be parsed.
 */
const runTscForScenario = (scenario: string): Metrics => {
  // Each scenario needs its own tsconfig that only includes that file, so the
  // counters are attributed to the scenario alone.
  mkdirSync(GENERATED_CONFIG_DIR, { recursive: true });
  const tsconfig = {
    extends: TSCONFIG_PATH,
    include: [join(SCENARIOS_DIR, `${scenario}.ts`)],
    exclude: [],
  };
  const configPath = join(GENERATED_CONFIG_DIR, `${scenario}.tsconfig.json`);
  writeFileSync(configPath, JSON.stringify(tsconfig));
  const output = execFileSync(
    process.execPath,
    [TSC_PATH, "-p", configPath, "--extendedDiagnostics", "--pretty", "false"],
    { encoding: "utf8" },
  );
  return parseDiagnostics(output);
};

/** Run the benchmark for a scenario several times and return the median value of each metric. */
const runScenario = (scenario: string, runCount: number): Metrics => {
  const runs: Metrics[] = [];
  for (let index = 0; index < runCount; index++) {
    const metrics = runTscForScenario(scenario);
    runs.push(metrics);
    console.log(
      `    run ${index + 1}/${runCount}: total ${metrics["Total time"].toFixed(2)}s, instantiations ${metrics.Instantiations}`,
    );
  }
  const aggregated = {} as Metrics;
  for (const name of ALL_METRICS) {
    aggregated[name] = median(runs.map((run) => run[name]));
  }
  return aggregated;
};

/** Run the benchmark for the given scenarios and return the median metrics of each. */
const runBenchmark = (scenarios: ReadonlyArray<string>, runCount: number): ScenarioMetrics => {
  const metrics = {} as ScenarioMetrics;
  for (const scenario of scenarios) {
    console.log(`\n[${scenario}]`);
    metrics[scenario] = runScenario(scenario, runCount);
  }
  return metrics;
};

/** Format a single metric value for the comparison table. */
const formatValue = (name: MetricName, value: number): string => {
  if ((TIME_NAMES as ReadonlyArray<string>).includes(name)) {
    return value.toFixed(2).padStart(12);
  }
  return String(Math.round(value)).padStart(12);
};

/** Print the current metrics alongside the baseline with per-metric deltas. */
const printComparison = (scenarios: ReadonlyArray<string>, metrics: ScenarioMetrics, baseline: Baseline): void => {
  const comparable = baseline.typescript === TYPESCRIPT_VERSION;
  console.log("");
  console.log("vs baseline:");
  if (!comparable) {
    console.log(
      `  baseline was recorded with typescript ${baseline.typescript} (current ${TYPESCRIPT_VERSION}) — deltas not shown`,
    );
  }
  let regressionCount = 0;
  for (const scenario of scenarios) {
    const baselineMetrics = baseline.scenarios[scenario];
    const currentMetrics = metrics[scenario];
    console.log(`\n[${scenario}]`);
    console.log(`  ${"metric".padEnd(16)}${"baseline".padStart(12)}${"current".padStart(12)}${"delta".padStart(10)}`);
    if (baselineMetrics === undefined || currentMetrics === undefined) {
      console.log("  no baseline recorded for this scenario.");
      continue;
    }
    for (const name of ALL_METRICS) {
      const baselineValue = baselineMetrics[name];
      const currentValue = currentMetrics[name];
      const deltaPercent = comparable ? ((currentValue - baselineValue) / baselineValue) * 100 : Number.NaN;
      const delta = Number.isNaN(deltaPercent) ? "" : `${deltaPercent >= 0 ? "+" : ""}${deltaPercent.toFixed(1)}%`;
      // Only the deterministic counters are regression signals; timings are too noisy.
      const isRegression =
        comparable &&
        (COUNTER_NAMES as ReadonlyArray<string>).includes(name) &&
        deltaPercent > REGRESSION_THRESHOLD_PERCENT;
      if (isRegression) {
        regressionCount++;
      }
      const marker = isRegression ? "  REGRESSION" : "";
      console.log(
        `  ${name.padEnd(16)}${formatValue(name, baselineValue)}${formatValue(name, currentValue)}${delta.padStart(10)}${marker}`,
      );
    }
  }
  console.log("");
  console.log(
    regressionCount > 0
      ? `${regressionCount} metric(s) over the ${REGRESSION_THRESHOLD_PERCENT}% threshold — informational only, CI is not failed.`
      : "No metrics over the regression threshold.",
  );
};

/**
 * Read the baseline file.
 *
 * @returns the baseline, or undefined when it does not exist yet.
 * @throws {Error} when the baseline file exists but can't be read or parsed.
 */
const loadBaseline = (): Baseline | undefined => {
  try {
    const parsed = JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as unknown;
    if (typeof parsed === "object" && parsed !== null && "scenarios" in parsed) {
      return parsed as Baseline;
    }
    // The pre-scenario flat baseline format is not compatible with per-scenario
    // comparisons; treat it as missing so the user re-records with --update.
    return undefined;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
};

/** Write the current metrics to the baseline file. */
const saveBaseline = (metrics: ScenarioMetrics): void => {
  const baseline: Baseline = {
    typescript: TYPESCRIPT_VERSION,
    created: new Date().toISOString(),
    scenarios: metrics,
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`);
};

/**
 * Entry point.
 *
 * @throws {Error} when an invalid `--runs` value is provided.
 */
const main = (): void => {
  const args = process.argv.slice(2);
  const updateBaseline = args.includes(UPDATE_BASELINE_FLAG);
  const runCountFlagIndex = args.indexOf(RUN_COUNT_FLAG);
  const runCount = runCountFlagIndex === -1 ? DEFAULT_RUN_COUNT : Number(args[runCountFlagIndex + 1]);
  if (!Number.isInteger(runCount) || runCount < 1) {
    throw new Error(`Invalid ${RUN_COUNT_FLAG} value; expected a positive integer.`);
  }
  const scenarioFlagIndex = args.indexOf(SCENARIO_FLAG);
  const requestedScenario = scenarioFlagIndex === -1 ? undefined : args[scenarioFlagIndex + 1];
  const allScenarios = getScenarioNames();
  const scenarios =
    requestedScenario === undefined ? allScenarios : allScenarios.filter((scenario) => scenario === requestedScenario);
  if (scenarios.length === 0) {
    const valid = allScenarios.length > 0 ? ` (valid scenarios: ${allScenarios.join(", ")})` : " (none found)";
    throw new Error(`Unknown ${SCENARIO_FLAG} value '${requestedScenario ?? ""}'${valid}.`);
  }

  console.log(`Type-check stress benchmark (typescript ${TYPESCRIPT_VERSION})`);
  console.log(`scenarios: ${scenarios.join(", ")}`);
  console.log(`running tsc --extendedDiagnostics for each scenario...`);
  const metrics = runBenchmark(scenarios, runCount);

  if (updateBaseline) {
    saveBaseline(metrics);
    console.log(`\nBaseline recorded to ${BASELINE_PATH}.`);
    return;
  }

  const baseline = loadBaseline();
  if (baseline === undefined) {
    console.log(`\nNo baseline found at ${BASELINE_PATH} — run with ${UPDATE_BASELINE_FLAG} to record one.`);
    return;
  }
  printComparison(scenarios, metrics, baseline);
};

main();
