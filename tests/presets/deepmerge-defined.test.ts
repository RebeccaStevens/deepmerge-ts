import test from "ava";

import { deepmergeDefined } from "deepmerge-ts/presets";

test(`does not replaces records with undefined`, (t) => {
  const x = { key1: { subkey: `one` } };
  const y = { key1: undefined };

  const expected = { key1: { subkey: `one` } };

  const merged = deepmergeDefined(x, y);

  t.deepEqual(merged, expected);
});

test("does not overwrite with undefined but keeps undefined values", (t) => {
  const x = { key1: "value1", key2: undefined };
  const y = { key1: undefined, key3: "value3" };
  const z = { key3: undefined, key4: "value4" };

  const expected = {
    key1: "value1",
    key2: undefined,
    key3: "value3",
    key4: "value4",
  };

  const merged = deepmergeDefined(x, y, z);

  t.deepEqual(merged, expected);
});
