import rollupPluginJSON from "@rollup/plugin-json";
import rollupPluginNodeResolve from "@rollup/plugin-node-resolve";
import rollupPluginTypescript from "@rollup/plugin-typescript";
import { defineConfig, type Plugin } from "rollup";
import rollupPluginAutoExternal from "rollup-plugin-auto-external";
import rollupPluginCopy from "rollup-plugin-copy";
import rollupPluginDts from "rollup-plugin-dts";

import pkg from "./package.json" assert { type: "json" };

/**
 * Get the intended boolean value from the given string.
 */
function getBoolean(value: unknown) {
  if (value === undefined) {
    return false;
  }
  const asNumber = Number(value);
  return Number.isNaN(asNumber)
    ? String(value).toLowerCase() === "false"
      ? false
      : Boolean(String(value))
    : Boolean(asNumber);
}

const buildTypesOnly = getBoolean(process.env["BUILD_TYPES_ONLY"]);

const common = defineConfig({
  output: {
    sourcemap: false,
  },

  external: ["deepmerge-ts"],

  treeshake: {
    annotations: true,
    moduleSideEffects: [],
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
});

const commonRuntimes = defineConfig({
  plugins: [
    rollupPluginAutoExternal(),
    rollupPluginNodeResolve(),
    rollupPluginTypescript({
      tsconfig: "tsconfig.build.json",
    }),
    rollupPluginJSON({
      preferConst: true,
    }),
  ],
});

const commonTypes = defineConfig({
  plugins: [
    rollupPluginTypescript({
      tsconfig: "tsconfig.build.json",
    }),
    rollupPluginDts(),
    rollupPluginCopy({
      targets: [
        { src: "types-legacy", dest: "dist/node/types", rename: "legacy" },
      ],
    }),
  ] as Plugin[],
});

const runtimes = defineConfig({
  ...common,
  ...commonRuntimes,

  input: "src/index.ts",

  output: [
    {
      ...common.output,
      file: pkg.exports["."].import,
      format: "esm",
    },
    {
      ...common.output,
      file: pkg.exports["."].require,
      format: "cjs",
    },
  ],
});

const types = defineConfig({
  ...common,
  ...commonTypes,

  input: "src/index.ts",

  output: [
    {
      file: pkg.exports["."].types.import,
      format: "esm",
    },
    {
      file: pkg.exports["."].types.require,
      format: "cjs",
    },
  ],
});

const presetRuntimes = defineConfig({
  ...common,
  ...commonRuntimes,

  input: "src/presets/index.ts",

  output: [
    {
      ...common.output,
      file: pkg.exports["./presets"].import,
      format: "esm",
    },
    {
      ...common.output,
      file: pkg.exports["./presets"].require,
      format: "cjs",
    },
  ],
});

const presetTypes = defineConfig({
  ...common,
  ...commonTypes,

  input: "src/presets/index.ts",

  output: [
    {
      file: pkg.exports["./presets"].types.import,
      format: "esm",
    },
    {
      file: pkg.exports["./presets"].types.require,
      format: "cjs",
    },
  ],
});

export default buildTypesOnly
  ? [types, presetTypes]
  : [runtimes, presetRuntimes, types, presetTypes];
