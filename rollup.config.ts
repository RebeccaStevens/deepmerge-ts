/**
 * Rollup Config.
 */

import rollupPluginNodeResolve from "@rollup/plugin-node-resolve";
import rollupPluginTypescript from "@rollup/plugin-typescript";
import { defineConfig, type Plugin } from "rollup";
import rollupPluginAutoExternal from "rollup-plugin-auto-external";
import rollupPluginDts from "rollup-plugin-dts";

import pkg from "./package.json" assert { type: "json" };

/**
 * Get new instances of all the common plugins.
 */
function getPlugins() {
  return [
    rollupPluginAutoExternal(),
    rollupPluginNodeResolve(),
    rollupPluginTypescript({
      tsconfig: "tsconfig.build.json",
    }),
  ] as Plugin[];
}

const common = defineConfig({
  input: "src/index.ts",

  output: {
    sourcemap: false,
  },

  external: [],

  treeshake: {
    annotations: true,
    moduleSideEffects: [],
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
});

const cjs = defineConfig({
  ...common,

  output: {
    ...common.output,
    file: pkg.exports.require,
    format: "cjs",
  },

  plugins: getPlugins(),
});

const esm = defineConfig({
  ...common,

  output: {
    ...common.output,
    file: pkg.exports.import,
    format: "esm",
  },

  plugins: getPlugins(),
});

const dts = defineConfig({
  ...common,

  output: [
    {
      file: pkg.exports.types.import,
      format: "esm",
    },
    {
      file: pkg.exports.types.require,
      format: "cjs",
    },
  ],

  plugins: [
    rollupPluginTypescript({
      tsconfig: "tsconfig.build.json",
    }),
    rollupPluginDts(),
  ] as Plugin[],
});

export default [cjs, esm, dts];
