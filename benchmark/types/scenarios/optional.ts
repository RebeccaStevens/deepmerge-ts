import { deepmerge } from "../../../src/index.ts";

type NestedOptions = {
  min?: number;
  max?: number;
  step?: number;
  label?: string;
};

type ServerOptions = {
  host: string;
  port?: number;
  tls?: boolean;
  retries?: number;
  timeout?: number;
};

type Config = {
  name: string;
  version?: string;
  server?: ServerOptions;
  logging?: {
    level?: "debug" | "info" | "warn" | "error";
    format?: string;
    nested?: { a?: { b?: { c?: { d?: string } } } };
  };
  limits?: NestedOptions;
  flags?: Record<string, boolean>;
};

const baseConfig: Config = { name: "app" };
const prodConfig: Config = {
  name: "app",
  version: "2.0.0",
  server: { host: "prod.example.com", port: 443, tls: true, retries: 3, timeout: 5000 },
  logging: { level: "info", format: "json", nested: { a: { b: { c: { d: "prod" } } } } },
  limits: { min: 1, max: 100, step: 1, label: "defaults" },
  flags: { "enable-feature-x": true },
};
const devConfig: Config = {
  name: "app",
  version: "2.0.0-dev",
  server: { host: "localhost", port: 8080, tls: false },
  logging: { level: "debug", nested: { a: { b: { c: { d: "dev" } } } } },
  limits: { max: 50 },
  flags: { "enable-feature-x": false, "enable-feature-y": true },
};
const patchConfig: Config = { name: "app", server: { host: "patch", retries: 5, timeout: 3000 } };

const o01 = deepmerge(baseConfig, prodConfig);
const o02 = deepmerge(prodConfig, devConfig);
const o03 = deepmerge(baseConfig, prodConfig, devConfig);
const o04 = deepmerge(devConfig, baseConfig, prodConfig, devConfig);
const o05 = deepmerge(prodConfig, patchConfig);
const o06 = deepmerge(patchConfig, baseConfig, prodConfig, devConfig, patchConfig);

type PartialConfig = Partial<Config>;
const pcA: PartialConfig = { server: { host: "a" } };
const pcB: PartialConfig = { limits: { min: 2 }, flags: { "enable-feature-z": true } };

const o07 = deepmerge(pcA, pcB);
const o08 = deepmerge(pcB, pcA, prodConfig, pcB);
const o09 = deepmerge({ server: { port: 3000 } }, { server: { host: "h" } }, { logging: { level: "warn" } });
const o10 = deepmerge(o01, o02, o03, o04);

export { o01, o02, o03, o04, o05, o06, o07, o08, o09, o10 };
