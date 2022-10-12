/**
 * Rollup Config.
 */

import rollupPluginJSON from "@rollup/plugin-json";
import rollupPluginNodeResolve from "@rollup/plugin-node-resolve";
import rollupPluginTypescript from "@rollup/plugin-typescript";
import { defineConfig, type Plugin } from "rollup";
import rollupPluginAutoExternal from "rollup-plugin-auto-external";
import rollupPluginCopy from "rollup-plugin-copy";
import rollupPluginDts from "rollup-plugin-dts";

import pkg from "./package.json";

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

const buildTypesOnly = getBoolean(process.env.BUILD_TYPES_ONLY);

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
    rollupPluginJSON({
      preferConst: true,
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
    file: pkg.main,
    format: "cjs",
  },

  plugins: getPlugins(),
});

const esm = defineConfig({
  ...common,

  output: {
    ...common.output,
    file: pkg.module,
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
    rollupPluginCopy({
      targets: [
        { src: "types-legacy", dest: "dist/node/types", rename: "legacy" },
      ],
    }),
  ] as Plugin[],
});

export default buildTypesOnly ? dts : [cjs, esm, dts];
