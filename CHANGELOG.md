# Changelog
All notable changes to this project will be documented in this file. Dates are displayed in UTC.

## [1.1.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.1...v1.1.2) (2021-09-17)


### Bug Fixes

* current and legacy types trying to using the same file resulting in one being overridden ([#10](https://github.com/RebeccaStevens/deepmerge-ts/issues/10)) ([a5f334b](https://github.com/RebeccaStevens/deepmerge-ts/commit/a5f334b2c4f6735383ea419dd6d3206bcc0afe4a))


### Performance Improvements

* add early escapes to loos when merging unknown types ([17a92e1](https://github.com/RebeccaStevens/deepmerge-ts/commit/17a92e1676a6b6c20f7e3fb1cc966ed5673dccf6))
* directly request enumerable keys so that they don't need to then be filtered ([04a2a5f](https://github.com/RebeccaStevens/deepmerge-ts/commit/04a2a5fb24b1086c8130203451c2836f196e92c6))
* use imperative loops when building merged result of records ([b36f7bc](https://github.com/RebeccaStevens/deepmerge-ts/commit/b36f7bcec43858658c06f8f4ac6deb17a9d7b2fe))

## [1.1.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.0...v1.1.1) (2021-09-16)


### Bug Fixes

* add legacy type information ([#6](https://github.com/RebeccaStevens/deepmerge-ts/issues/6)) ([c7e1019](https://github.com/RebeccaStevens/deepmerge-ts/commit/c7e1019f86818fe95b9f6291f2a09f077337a7f9))
* only merge enumerable properties ([#8](https://github.com/RebeccaStevens/deepmerge-ts/issues/8)) ([0967070](https://github.com/RebeccaStevens/deepmerge-ts/commit/0967070d30427bb33f0c78793d61a9411dde3b49))

# [1.1.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.0.1...v1.1.0) (2021-09-13)


### Features

* add support for custom merging ([#4](https://github.com/RebeccaStevens/deepmerge-ts/issues/4)) ([5413b81](https://github.com/RebeccaStevens/deepmerge-ts/commit/5413b81c0a568c798ff70081966dd9a0ace5fe3f))

## [1.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.0.0...v1.0.1) (2021-08-25)


### Bug Fixes

* husky install no longer runs on postinstall ([7102229](https://github.com/RebeccaStevens/deepmerge-ts/commit/7102229a7078fef17ba2a24c9814a844fb525c67))

# 1.0.0 (2021-08-25)


### Features

* add "module" property to package.json ([168747d](https://github.com/RebeccaStevens/deepmerge-ts/commit/168747daef0b49ab8ac3b0491fda965776eef2c2))
* add basic functionality ([8e3ba66](https://github.com/RebeccaStevens/deepmerge-ts/commit/8e3ba66973d6e35cc421149a00a45b7c55c1de45))
