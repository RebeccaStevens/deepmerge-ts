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

### Example using default config

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

const merged = deepmerge(x, y);

console.log(merged);

// Prettierfied output:
//
// {
//   record: {
//      prop1: "changed",
//      prop2: "value2",
//      prop3: "value3"
//   }
//   array: (6) [1, 2, 3, 2, 3, 4]
//   set: Set(4) {1, 2, 3, 4}
//   map: Map(3) {
//    "key1" => "value1",
//    "key2" => "changed",
//    "key3" => "value3"
//   }
// }
```

### Using customized config

[See deepmerge custom docs](./docs/deepmergeCustom.md).

## API

### deepmerge(x, y, ...)

Merges the given inputs together using the default configuration.

#### deepmerge(...inputs)

Merges the array of inputs together using the default configuration.

Note: If `inputs` isn't typed as a tuple then we cannot determine the output type. The output type will simply be `unknown`.

### deepmergeCustom(options)

Generate a customized deepmerge function using the given options. The returned function works just like `deepmerge` except it uses the customized configuration.

#### options

The following options can be used to customize the deepmerge function.\
All these options are optional.

##### `mergeRecords`

Type: `false | (values: Record<any, unknown>[], utils: DeepMergeMergeFunctionUtils) => unknown`

If false, records won't be merged. If set to a function, that function will be used to merge records.

Note: Records are "vanilla" objects (e.g. `{ foo: "hello", bar: "world" }`).

##### `mergeArrays`

Type: `false | (values: unknown[][], utils: DeepMergeMergeFunctionUtils) => unknown`

If false, arrays won't be merged. If set to a function, that function will be used to merge arrays.

##### `mergeMaps`

Type: `false | (values: Map<unknown, unknown>[], utils: DeepMergeMergeFunctionUtils) => unknown`

If false, maps won't be merged. If set to a function, that function will be used to merge maps.

##### `mergeSets`

Type: `false | (values: Set<unknown>[], utils: DeepMergeMergeFunctionUtils) => unknown`

If false, sets won't be merged. If set to a function, that function will be used to merge sets.

##### `mergeOthers`

Type: `false | (values: Set<unknown>[], utils: DeepMergeMergeFunctionUtils) => unknown`

If set to a function, that function will be used to merge everything else.

Note: This includes merging mixed types, such as merging a map with an array.

#### DeepMergeMergeFunctionUtils

This is a set of utility functions that are made available to your custom merge functions.

##### `mergeFunctions`

These are all the merge function being used to perform the deepmerge.\
These will be the custom merge functions you gave, or the default merge functions for options you didn't customize.

##### `defaultMergeFunctions`

These are all the merge functions that the default, non-customize deepmerge function uses.

##### `deepmerge`

This is your top level customized deepmerge function.

Note: Be careful when calling this as it is really easy to end up in an infinite loop.
