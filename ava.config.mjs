const avaConfig = {
  files: ["tests/**/*.test.*"],
  timeout: "5m",
  extensions: {
    ts: "module",
  },
  nodeArguments: [
    "--no-warnings",
    "--loader=ts-paths-esm-loader/transpile-only",
    "--experimental-specifier-resolution=node",
  ],
};

export default avaConfig;
