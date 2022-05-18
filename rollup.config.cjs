require("ts-node").register({
  compilerOptions: {
    module: "CommonJS",
    resolveJsonModule: true,
  },
});

module.exports = require("./rollup.config.ts");
