const avaConfig = {
  files: ["tests/**/*.test.*", "!tests/deno/**/*.test.*"],
  timeout: "5m",
  extensions: ["ts"],
  require: ["ts-node/register", "tsconfig-paths/register"],
  environmentVariables: {
    TS_NODE_PROJECT: "tests/tsconfig.json",
  },
};

export default avaConfig;
