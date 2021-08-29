<div align="center">

# DeepmergeTS

[![npm version](https://img.shields.io/npm/v/deepmerge-ts.svg)](https://www.npmjs.com/package/deepmerge-ts)
[![CI](https://github.com/RebeccaStevens/deepmerge-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/RebeccaStevens/deepmerge-ts/actions/workflows/ci.yml)
[![Coverage Status](https://codecov.io/gh/RebeccaStevens/deepmerge-ts/branch/main/graph/badge.svg?token=MVpR1oAbIT)](https://codecov.io/gh/RebeccaStevens/deepmerge-ts)\
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![GitHub Discussions](https://img.shields.io/github/discussions/RebeccaStevens/deepmerge-ts?style=flat-square)](https://github.com/RebeccaStevens/deepmerge-ts/discussions)
[![BSD 3 Clause license](https://img.shields.io/github/license/RebeccaStevens/deepmerge-ts.svg?style=flat-square)](https://opensource.org/licenses/BSD-3-Clause)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)

Deeply merge 2 or more objects respecting type information.

</div>

## Installation

### Node

```sh
# Install with npm
npm install deepmerge-ts --save-dev

# Install with yarn
yarn add -D deepmerge-ts
```

## Features

- Merged output has correct typing.
- Record merging support.
- Array merging support.
- Map and Set merging support.
- Customized merging.

## Usage

### Basic Example

```js
import { deepmerge } from "deepmerge-ts";

const x = {
  record: {
    prop1: "value1",
    prop2: "value2",
  },
  array: [1, 2, 3],
  set: new Set([1, 2, 3]),
  map: new Map([
    ["key1", "value1"],
    ["key2", "value2"],
  ]),
};

const y = {
  record: {
    prop1: "changed",
    prop3: "value3",
  },
  array: [2, 3, 4],
  set: new Set([2, 3, 4]),
  map: new Map([
    ["key2", "changed"],
    ["key3", "value3"],
  ]),
};

const output = {
  record: {
    prop1: "changed",
    prop2: "value2",
    prop3: "value3",
  },
  array: [1, 2, 3, 2, 3, 4],
  set: new Set([1, 2, 3, 4]),
  map: new Map([
    ["key1", "value1"],
    ["key2", "changed"],
    ["key3", "value3"],
  ]),
};

deepmerge(x, y); // => output
```

### Simple Customized Example

```js
import type { DeepMergeLeafURI } from "deepmerge-ts";
import { deepmergeCustom } from "deepmerge-ts";

/**
 * Create a custom deepmerge function that does not merge arrays, sets, or maps.
 */
const customDeepmerge = deepmergeCustom<{
  DeepMergeArraysURI: DeepMergeLeafURI; // <-- Needed for correct typing information.
  DeepMergeSetsURI: DeepMergeLeafURI;
  DeepMergeMapsURI: DeepMergeLeafURI;
}>({
  mergeArrays: false,
  mergeSets: false,
  mergeMaps: false,
});

const x = { foo: [1, 2], bar: [3, 4] };
const y = { foo: [5, 6] };

customDeepmerge(x, y); // => { foo: [5, 6], bar: [3, 4] }
```

### Advanced Customized Example

```ts
import type { DeepMergeMergeFunctionURItoKind, DeepMergeMergeFunctionsURIs } from "deepmerge-ts";
import { deepmergeCustom } from "deepmerge-ts";

declare module "deepmerge-ts" {
  interface DeepMergeMergeFunctionURItoKind<
    T1,
    T2,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    /**
     * Define how 2 "other" types are merged.
     */
    readonly MyMergeOthersFn: T1 extends Date
      ? T2 extends Date
        ? [T1, T2]
        : T2 extends Readonly<ReadonlyArray<Date>>
          ? [T1, ...T2]
          : T2
      : T1 extends Readonly<ReadonlyArray<Date>>
        ? T2 extends Date
          ? [...T1, T2]
          : T2
        : T2;
  }
}

/**
 * Create a custom deepmerge function that amalgamates dates into an array.
 */
const customDeepmerge = deepmergeCustom<{
  DeepMergeOthersURI: "MyMergeOthersFn";
}>({
  /**
   * Define how 2 "other" values are merged.
   */
  mergeOthers: (val1, val2) => {
    // How 2 dates are merged.
    if (val1 instanceof Date && val2 instanceof Date) {
      return [val1, val2];
    }
    // How an array of dates and a date are merged.
    // This is not needed if only merge 2 values.
    if (
      Array.isArray(val1) &&
      val2 instanceof Date &&
      val1.every((val) => val instanceof Date)
    ) {
      return [...val1, val2];
    }
    // How a date and an array of dates are merged.
    // This is not needed if only merge 2 values.
    if (
      val1 instanceof Date
      Array.isArray(val2) &&
      val2.every((val) => val instanceof Date)
    ) {
      return [val1, ...val2];
    }
    // Something else? Return the 2nd value.
    return val2;
  },
});

const x = { foo: new Date("2020-01-01") };
const y = { foo: new Date("2021-02-02") };
const z = { foo: new Date("2022-03-03") };

customDeepmerge(x, y, z); // => { foo: [Date, Date, Date] }
```
