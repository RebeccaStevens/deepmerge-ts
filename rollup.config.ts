/**
 * Rollup Config.
 */

import * as path from "node:path";

import rollupPluginJSON from "@rollup/plugin-json";
import rollupPluginNodeResolve from "@rollup/plugin-node-resolve";
import rollupPluginTypescript from "@rollup/plugin-typescript";
import type { Plugin, PreRenderedChunk, RollupOptions } from "rollup";
import rollupPluginAutoExternal from "rollup-plugin-auto-external";
import rollupPluginCopy from "rollup-plugin-copy";
import rollupPluginDts from "rollup-plugin-dts";

import pkg from "./package.json";

const outDir = "dist/node";

function getEntryFileNames(
  type: "import" | "require" | "types"
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
): (chunkInfo: PreRenderedChunk) => string {
  return (chunkInfo) => {
    const relPath = path.relative(
      path.join(__dirname, "/src"),
      chunkInfo.facadeModuleId ?? ""
    );

    switch (relPath) {
      case "index.ts":
        return path.relative(outDir, pkg.exports["."][type]);
      case "presets/index.ts":
        return path.relative(outDir, pkg.exports["./presets"][type]);
    }

    throw new Error("Unknown import");
  };
}

const common: Partial<RollupOptions> = {
  input: ["src/index.ts", "src/presets/index.ts"],

  output: {
    dir: outDir,
    sourcemap: false,
  },

  external: [],

  treeshake: {
    annotations: true,
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
};

function resolveSelf(): Plugin {
  return {
    name: "resolve-self",

    resolveId(source, importer, options) {
      const updatedId =
        source === pkg.name
          ? "./src/index.ts"
          : source === `${pkg.name}/presets`
          ? "./src/presets/index.ts"
          : undefined;

      if (updatedId === undefined) {
        return undefined;
      }

      return { id: path.resolve(process.cwd(), updatedId) };
    },
  };
}

/**
 * Get new instances of all the common plugins.
 */
function getPlugins(): NonNullable<RollupOptions["plugins"]> {
  return [
    rollupPluginAutoExternal(),
    resolveSelf(),
    rollupPluginNodeResolve(),
    rollupPluginTypescript({
      tsconfig: "tsconfig.build.json",
      compilerOptions: {
        outDir,
      },
    }),
    rollupPluginJSON({
      preferConst: true,
    }),
  ];
}

const cjs: RollupOptions = {
  ...common,

  output: {
    ...common.output,
    entryFileNames: getEntryFileNames("require"),
    chunkFileNames: "common.cjs",
    format: "cjs",
  },

  plugins: getPlugins(),
};

const esm: RollupOptions = {
  ...common,

  output: {
    ...common.output,
    entryFileNames: getEntryFileNames("import"),
    chunkFileNames: "common.mjs",
    format: "esm",
  },

  plugins: getPlugins(),
};

const dts = {
  ...common,

  output: {
    ...common.output,
    entryFileNames: getEntryFileNames("types"),
    chunkFileNames: "types/current/common.d.ts",
    format: "es",
  },

  plugins: [
    resolveSelf(),
    rollupPluginDts(),
    rollupPluginTypescript({
      tsconfig: "tsconfig.build.json",
      compilerOptions: {
        outDir,
      },
    }),
    rollupPluginCopy({
      targets: [
        { src: "types-legacy", dest: "dist/node/types", rename: "legacy" },
      ],
    }),
  ],
};

export default [dts, cjs, esm];
