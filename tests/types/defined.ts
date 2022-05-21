import { deepmergeDefined } from "deepmerge-ts/presets";

const a = {
  foo: "abc",
  baz: {
    quux: ["def", "ghi"],
  },
  garply: undefined,
};

const b = {
  foo: undefined,
  baz: {
    quux: undefined,
    corge: undefined,
  },
  garply: [1, 2],
  grault: 42,
};

// $ExpectType { foo: string; baz: { quux: string[]; corge?: undefined; }; garply: number[]; grault: number; }
deepmergeDefined(a, b);
