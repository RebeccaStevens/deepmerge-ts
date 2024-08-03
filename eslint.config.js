// @ts-check
import rsEslint from "@rebeccastevens/eslint-config";

export default rsEslint(
  {
    projectRoot: import.meta.dirname,
    mode: "library",
    typescript: {
      unsafe: "off",
    },
    formatters: true,
    functional: false,
    jsonc: true,
    markdown: true,
    stylistic: true,
    yaml: true,
    ignores: ["tests/modules", "tests/types", "benchmark/data.json"],
  },
  {
    files: ["tests/utils.ts"],
    rules: {
      "jsdoc/require-jsdoc": "off",
    },
  },
  {
    files: ["benchmark/**/*.ts"],
    rules: {
      "import/no-extraneous-dependencies": "off",
      "jsdoc/require-jsdoc": "off",
      "no-console": "off",
    },
  },
);
