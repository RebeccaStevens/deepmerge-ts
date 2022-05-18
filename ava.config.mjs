const avaConfig = {
  files: ["tests/**/*.test.*"],
  timeout: "5m",
  extensions: ["ts"],
  require: ["ts-node/register/transpile-only"],
  environmentVariables: {
    TS_NODE_PROJECT: "tests/tsconfig.json",
  },
};

export default avaConfig;
