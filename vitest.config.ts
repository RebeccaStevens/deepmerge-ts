import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    include: ["./tests/**/*.test.ts"],
    exclude: ["dist", "node_modules"],
    coverage: {
      all: true,
      include: ["src"],
      exclude: ["src/types", "dist"],
      reporter: ["lcov", "text"],
      watermarks: {
        lines: [80, 95],
        functions: [80, 95],
        branches: [80, 95],
        statements: [80, 95],
      },
    },
  },
});
