import rollupPluginReplace from "@rollup/plugin-replace";
import { rollupPlugin as rollupPluginDeassert } from "deassert";
import type { RollupOptions } from "rollup";
import rollupPluginTs from "rollup-plugin-ts";

import pkg from "./package.json" assert { type: "json" };

const externalDependencies = [
  ...Object.keys((pkg as any).dependencies ?? {}),
  ...Object.keys((pkg as any).peerDependencies ?? {}),
];

const library = {
  input: "src/index.ts",

  output: [
    {
      file: pkg.exports.import,
      format: "esm",
      sourcemap: false,
    },
    {
      file: pkg.exports.require,
      format: "cjs",
      sourcemap: false,
    },
  ],

  external: (source) => {
    if (externalDependencies.some((dep) => source.startsWith(dep))) {
      return true;
    }
    return undefined;
  },

  plugins: [
    rollupPluginTs({
      transpileOnly: true,
      tsconfig: "tsconfig.build.json",
    }),
    rollupPluginReplace({
      values: {
        "import.meta.vitest": "undefined",
      },
      preventAssignment: true,
    }),
    rollupPluginDeassert({
      include: ["**/*.{js,ts}"],
    }),
  ],

  treeshake: {
    annotations: true,
    moduleSideEffects: [],
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
} satisfies RollupOptions;

export default [library];
