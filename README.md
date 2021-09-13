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

## Usage

### Example

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

deepmerge(x, y) // => output
```
