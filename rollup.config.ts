import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import rollupPluginReplace from "@rollup/plugin-replace";
import { rollupPlugin as rollupPluginDeassert } from "deassert";
import { type RollupOptions } from "rollup";
import rollupPluginCopy from "rollup-plugin-copy";
import rollupPluginTs from "rollup-plugin-ts";

import p from "./package.json" assert { type: "json" };

const root = dirname(fileURLToPath(import.meta.url));
const nodeDistPath = join(root, "dist/node");

const pkg = p as typeof p & {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const treeshake = {
  annotations: true,
  moduleSideEffects: [],
  propertyReadSideEffects: false,
  unknownGlobalSideEffects: false,
} satisfies RollupOptions["treeshake"];

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

  external: [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ],

  plugins: [
    rollupPluginTs({
      transpileOnly: true,
      tsconfig: "tsconfig.build.json",
      hook: {
        outputPath: (path, kind) => {
          if (kind === "declaration") {
            const relativePathToNodeDist = relative(nodeDistPath, path);
            return join(nodeDistPath, "types/current", relativePathToNodeDist);
          }
          return path;
        },
      },
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
    rollupPluginCopy({
      targets: [
        { src: "types-legacy", dest: "dist/node/types", rename: "legacy" },
      ],
    }),
  ],

  treeshake,
} satisfies RollupOptions;

export default [library];
