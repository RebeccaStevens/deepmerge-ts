# Changelog
All notable changes to this project will be documented in this file. Dates are displayed in UTC.

## [8.0.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v8.0.1...v8.0.2) (2026-08-21)


### Bug Fixes

* correct node engine requirement to >=16.9.0 ([ef54ea6](https://github.com/RebeccaStevens/deepmerge-ts/commit/ef54ea635ea3362a25afd4396d5cbf60a98c1c74))

## [8.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v8.0.0...v8.0.1) (2026-08-16)


### Bug Fixes

* typescript 7 support ([#714](https://github.com/RebeccaStevens/deepmerge-ts/issues/714)) ([b307b77](https://github.com/RebeccaStevens/deepmerge-ts/commit/b307b77261375cc89b3a42d11d0df4ca029027ac))

# [8.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.1.6...v8.0.0) (2026-08-16)


### Bug Fixes

* stop deepmergeInto from leak-mutating nested input containers ([2cd7824](https://github.com/RebeccaStevens/deepmerge-ts/commit/2cd782463b532a89c5196fc8ed24ccf0e3308395))


### Code Refactoring

* rename mergeInfo system and align shorthand, add JSDoc examples ([590ed9b](https://github.com/RebeccaStevens/deepmerge-ts/commit/590ed9ba3b5ef24572d8d7ef3ca3dd494d595823))


### Features

* add circular reference support, maxDepth option, and hierarchy tracking ([#707](https://github.com/RebeccaStevens/deepmerge-ts/issues/707)) ([3984927](https://github.com/RebeccaStevens/deepmerge-ts/commit/398492757b3f22a0d7d89b09ce1ae9cd32806c9a))
* add deepmergeFastUnsafe and deepmergeIntoFastUnsafe entrypoints ([#708](https://github.com/RebeccaStevens/deepmerge-ts/issues/708)) ([df9b11c](https://github.com/RebeccaStevens/deepmerge-ts/commit/df9b11c0059be64081b2fef5a4c235c9e44bf52c))
* support deep map value merging ([ac4bf7a](https://github.com/RebeccaStevens/deepmerge-ts/commit/ac4bf7aade17fb68dbb58e8594482e2fc8e67575)), closes [#705](https://github.com/RebeccaStevens/deepmerge-ts/issues/705)


### Performance Improvements

* add a dedicated fast path for merging 2 records ([4dbcea7](https://github.com/RebeccaStevens/deepmerge-ts/commit/4dbcea7280786a63e92b08034ef54ae902549e38))
* avoid array reallocation when no undefined values exist ([99f2241](https://github.com/RebeccaStevens/deepmerge-ts/commit/99f2241c802cc8f348b6b9a0544abd2bd3967195)), closes [#696](https://github.com/RebeccaStevens/deepmerge-ts/issues/696)
* optimize array and set merging ([8d435f9](https://github.com/RebeccaStevens/deepmerge-ts/commit/8d435f99dd2e4c7e72b2195f40914786a1895374)), closes [#698](https://github.com/RebeccaStevens/deepmerge-ts/issues/698)
* optimize map merging and remove dead code ([14e1604](https://github.com/RebeccaStevens/deepmerge-ts/commit/14e1604588d417d7879d4acf482bd299b73cc4c9)), closes [#702](https://github.com/RebeccaStevens/deepmerge-ts/issues/702)
* optimize record key and type detection ([fa85462](https://github.com/RebeccaStevens/deepmerge-ts/commit/fa854629e6a93b736c771369eb5187f71f2a1faf)), closes [#694](https://github.com/RebeccaStevens/deepmerge-ts/issues/694)
* reduce benchmark sample count so the bench fits in 512MB heap ([66635e3](https://github.com/RebeccaStevens/deepmerge-ts/commit/66635e305854f2b90fea22511d3480cbe191058d))
* reduce type-level work and shortcut same-type merges ([473a971](https://github.com/RebeccaStevens/deepmerge-ts/commit/473a97162bc97ca1bd6dc2e6e8d00450abbadec0))
* speed up the mergeUnknowns hot path ([95b2964](https://github.com/RebeccaStevens/deepmerge-ts/commit/95b2964fbcceee9725ca6c9cb9169298415cebb3)), closes [#699](https://github.com/RebeccaStevens/deepmerge-ts/issues/699)


### BREAKING CHANGES

* deepmergeInto no longer leak-mutates input containers.
Code that depended on inputs being merged into the target through alias
must now pass copies explicitly. The documented 'update the target'
behavior is preserved on the target itself.
* - DeepMergeMetaMetaData has been renamed to DeepMergeMergeInfo. Imports
  must be updated.
- The MetaDataUpdater callback's `metaMeta` parameter is now `mergeInfo`.
  Implementations must update the parameter name accordingly.
- The MM generic shorthand has been renamed to MI (e.g. in
  `MetaDataUpdater<M, MI>`).
* The `DeepMergeIntoFunctionUtils` type has been renamed to `DeepMergeIntoUtils`.
* Updates the internal calculation logic for mergeMaps and
mergeMapsInto. Colliding keys will now be merged.

## [7.1.6](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.1.5...v7.1.6) (2026-08-11)


### Bug Fixes

* preserve known keys when merging objects with index signatures ([#692](https://github.com/RebeccaStevens/deepmerge-ts/issues/692)) ([e86cd8c](https://github.com/RebeccaStevens/deepmerge-ts/commit/e86cd8c724aa83ab6fc32e8a5a1d810b5ad5e81b))

## [7.1.5](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.1.4...v7.1.5) (2025-02-23)


### Bug Fixes

* improve type merging of nested optional properties ([#530](https://github.com/RebeccaStevens/deepmerge-ts/issues/530)) ([349fd14](https://github.com/RebeccaStevens/deepmerge-ts/commit/349fd14d20405f2a56ff9ce788959db38fc970f4))

## [7.1.4](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.1.3...v7.1.4) (2025-01-23)


### Bug Fixes

* apply filtering to types when selecting a leaf node ([#526](https://github.com/RebeccaStevens/deepmerge-ts/issues/526)) ([6d85163](https://github.com/RebeccaStevens/deepmerge-ts/commit/6d85163aecce3981b3a2f5378cb17f471fa7566b)), closes [#524](https://github.com/RebeccaStevens/deepmerge-ts/issues/524)

## [7.1.3](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.1.2...v7.1.3) (2024-10-08)

## [7.1.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.1.1...v7.1.2) (2024-10-08)


### Performance Improvements

* use more performant data structures ([#519](https://github.com/RebeccaStevens/deepmerge-ts/issues/519)) ([a48f8c4](https://github.com/RebeccaStevens/deepmerge-ts/commit/a48f8c4ccc32ec8937cc7177991a072a93e329b2))

## [7.1.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.1.0...v7.1.1) (2024-10-04)


### Performance Improvements

* add explicit return type to speed up types ([8e1ff6d](https://github.com/RebeccaStevens/deepmerge-ts/commit/8e1ff6d04abe4ae0d541bba817054578924ca3db))

# [7.1.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.0.3...v7.1.0) (2024-07-20)


### Features

* **benchmark:** add `defu` to compare with ([#486](https://github.com/RebeccaStevens/deepmerge-ts/issues/486)) ([93599b4](https://github.com/RebeccaStevens/deepmerge-ts/commit/93599b4bb6cd341cbaef156d619530a16e34550f))

## [7.0.3](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.0.2...v7.0.3) (2024-06-06)


### Bug Fixes

* merge functions' types ([ca94270](https://github.com/RebeccaStevens/deepmerge-ts/commit/ca94270da73d0a071043ef0e8936b17c444e40ab))

## [7.0.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.0.1...v7.0.2) (2024-06-03)


### Bug Fixes

* support older module resolutions ([063675e](https://github.com/RebeccaStevens/deepmerge-ts/commit/063675eccc19f0565527a2ec584d76801ccfe249)), closes [#480](https://github.com/RebeccaStevens/deepmerge-ts/issues/480)

## [7.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v7.0.0...v7.0.1) (2024-05-21)


### Bug Fixes

* handling of partial types ([1832bd0](https://github.com/RebeccaStevens/deepmerge-ts/commit/1832bd071b925c49a2d5d1c944703916ee4348d4)), closes [#476](https://github.com/RebeccaStevens/deepmerge-ts/issues/476)

# [7.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v6.0.3...v7.0.0) (2024-05-20)


### Code Refactoring

* rename DeepMergeFunctionUtils to DeepMergeUtils ([e821255](https://github.com/RebeccaStevens/deepmerge-ts/commit/e821255380dd9307041e6749c43d363e4e2ae633))
* rename DeepMergeMerge* to DeepMerge* ([fd4d2d4](https://github.com/RebeccaStevens/deepmerge-ts/commit/fd4d2d462eec14841adc45d741148cc7a9449a1f))


### Features

* allow filtering out values before merging them ([0784f63](https://github.com/RebeccaStevens/deepmerge-ts/commit/0784f63befc4ab4d66b6f3ae4b2076fba203fb48)), closes [#460](https://github.com/RebeccaStevens/deepmerge-ts/issues/460)


### BREAKING CHANGES

* rename DeepMergeFunctionUtils to DeepMergeUtils
* rename DeepMergeMerge* to DeepMerge*
* allow filtering out values before merging them

## [6.0.3](https://github.com/RebeccaStevens/deepmerge-ts/compare/v6.0.2...v6.0.3) (2024-05-20)


### Bug Fixes

* deepmergeInto unsafe key value assignment ([6b04863](https://github.com/RebeccaStevens/deepmerge-ts/commit/6b048630ca13052927a85a802a9fe9977519db4c))

## [6.0.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v6.0.1...v6.0.2) (2024-05-20)


### Bug Fixes

* return type when using empty records ([6b4ff3f](https://github.com/RebeccaStevens/deepmerge-ts/commit/6b4ff3f42951cd9b548d2b4adb184fed4e35be2d)), closes [#465](https://github.com/RebeccaStevens/deepmerge-ts/issues/465)

## [6.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v6.0.0...v6.0.1) (2024-05-20)


### Bug Fixes

* type when merging index signatures ([5e8b9b6](https://github.com/RebeccaStevens/deepmerge-ts/commit/5e8b9b668a13ef51da10a5321d4698d01d872013)), closes [#459](https://github.com/RebeccaStevens/deepmerge-ts/issues/459)

# [6.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v5.1.0...v6.0.0) (2024-05-19)


### Bug Fixes

* type when merging optional properties of a record ([fa9ace2](https://github.com/RebeccaStevens/deepmerge-ts/commit/fa9ace2a2b38030d12fa85634966d409b8bb123f))


### Build System

* remove typing support for typescript<4.7 ([f2f5956](https://github.com/RebeccaStevens/deepmerge-ts/commit/f2f5956d653a672073fc3c0174f9d8d6ca9d4371))


### Features

* allow restricting what types can be passed in as parameters ([69e9ba3](https://github.com/RebeccaStevens/deepmerge-ts/commit/69e9ba3519319eb02763887f457549340e9a9c76)), closes [#305](https://github.com/RebeccaStevens/deepmerge-ts/issues/305)
* remove deprecated type DeepMergeLeafHKT ([1982e56](https://github.com/RebeccaStevens/deepmerge-ts/commit/1982e56016cbbbfd07f78e8512b56e8294ff83c0))
* undefined will no longer replace defined values by default ([9c86605](https://github.com/RebeccaStevens/deepmerge-ts/commit/9c866054cbade77118b5cd62b1e8e68033fe2879))


### Performance Improvements

* remove BlacklistedRecordProps ([19d4944](https://github.com/RebeccaStevens/deepmerge-ts/commit/19d4944fa228d66d5af93f419526ffaf8b5a376b))


### BREAKING CHANGES

* remove deprecated type DeepMergeLeafHKT
* undefined will no longer replace defined values by default
* The order of the generics of `deepmergeCustom`
and `deepmergeIntoCustom` have changed. If you are passing generics
to these functions you need to update them.
* remove typing support for typescript<4.7

# [5.1.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v5.0.0...v5.1.0) (2023-04-04)


### Features

* expose some of the internal utils ([a11a03d](https://github.com/RebeccaStevens/deepmerge-ts/commit/a11a03d0fcd5e1caad371c5eb5a19052b8980691))

# [5.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.3.0...v5.0.0) (2023-03-18)


### Bug Fixes

* add missing dev dep ([df4add2](https://github.com/RebeccaStevens/deepmerge-ts/commit/df4add2a0aba101b0b00527cb105d194e17bdfaf))
* remove unneeded eslint disable ([be28290](https://github.com/RebeccaStevens/deepmerge-ts/commit/be28290a3efb533ab339ef88e297b3e057708603))
* use default MM generics ([944b428](https://github.com/RebeccaStevens/deepmerge-ts/commit/944b428e3779904c32d071a2761753872ab717f4)), closes [#304](https://github.com/RebeccaStevens/deepmerge-ts/issues/304)


### chore

* drop support for node 12 and 14 ([77016f7](https://github.com/RebeccaStevens/deepmerge-ts/commit/77016f70664b6f5857b9f278912a31aa219be80d))


### BREAKING CHANGES

* drop support for node 12 and 14

# [5.0.0-next.4](https://github.com/RebeccaStevens/deepmerge-ts/compare/v5.0.0-next.3...v5.0.0-next.4) (2023-03-18)


### Bug Fixes

* remove unneeded eslint disable ([be28290](https://github.com/RebeccaStevens/deepmerge-ts/commit/be28290a3efb533ab339ef88e297b3e057708603))
* use default MM generics ([944b428](https://github.com/RebeccaStevens/deepmerge-ts/commit/944b428e3779904c32d071a2761753872ab717f4)), closes [#304](https://github.com/RebeccaStevens/deepmerge-ts/issues/304)

# [5.0.0-next.3](https://github.com/RebeccaStevens/deepmerge-ts/compare/v5.0.0-next.2...v5.0.0-next.3) (2023-03-18)


### Bug Fixes

* add missing dev dep ([df4add2](https://github.com/RebeccaStevens/deepmerge-ts/commit/df4add2a0aba101b0b00527cb105d194e17bdfaf))

# [5.0.0-next.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v5.0.0-next.1...v5.0.0-next.2) (2023-02-06)


### Features

* create deepmergeInto function ([9c350a0](https://github.com/RebeccaStevens/deepmerge-ts/commit/9c350a051c16534907da459ff466a353b90d5505)), closes [#51](https://github.com/RebeccaStevens/deepmerge-ts/issues/51)

# [5.0.0-next.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.2.2...v5.0.0-next.1) (2023-02-02)


### chore

* drop support for node 12 and 14 ([77016f7](https://github.com/RebeccaStevens/deepmerge-ts/commit/77016f70664b6f5857b9f278912a31aa219be80d))


### BREAKING CHANGES

* drop support for node 12 and 14
# [4.3.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.2.2...v4.3.0) (2023-02-06)


### Features

* create deepmergeInto function ([9c350a0](https://github.com/RebeccaStevens/deepmerge-ts/commit/9c350a051c16534907da459ff466a353b90d5505)), closes [#51](https://github.com/RebeccaStevens/deepmerge-ts/issues/51)

## [4.2.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.2.1...v4.2.2) (2022-09-19)

## [4.2.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.2.0...v4.2.1) (2022-06-15)


### Bug Fixes

* broken type info path ([#146](https://github.com/RebeccaStevens/deepmerge-ts/issues/146)) ([b875711](https://github.com/RebeccaStevens/deepmerge-ts/commit/b8757111ccff257e7403b5d91235b965b4542afd))

# [4.2.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.1.0...v4.2.0) (2022-06-15)


### Features

* export types for module resolution node 16 ([20241c5](https://github.com/RebeccaStevens/deepmerge-ts/commit/20241c5bdffcc77025ea778257193f1afbe40768))


### Performance Improvements

* **ts:** add variance annotations ([cecc9db](https://github.com/RebeccaStevens/deepmerge-ts/commit/cecc9dbcfc68335f04372e2fa339a347f71c90bc))
* **ts:** use extends constraints on infer ([f053e76](https://github.com/RebeccaStevens/deepmerge-ts/commit/f053e76221fb790f1dead0b2b5c9a9f4432cb1d8))

# [4.1.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.4...v4.1.0) (2022-06-13)


### Features

* treat module imports as records ([20c0dfb](https://github.com/RebeccaStevens/deepmerge-ts/commit/20c0dfb82e4273b10e5a02ba0e74aada42b9bb7a)), closes [#133](https://github.com/RebeccaStevens/deepmerge-ts/issues/133)

## [4.0.4](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.3...v4.0.4) (2022-06-13)


### Bug Fixes

* drop keys that have no enumerable properties ([3363570](https://github.com/RebeccaStevens/deepmerge-ts/commit/3363570fcc53488d22a2d4b778b558173c7ee5c9))

## [4.0.3](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.2...v4.0.3) (2022-04-06)


### Bug Fixes

* use explict return types for function that return a HKT ([eb4183e](https://github.com/RebeccaStevens/deepmerge-ts/commit/eb4183e5441ea8b36bbb8f24ffa38ba850eb389c)), closes [#94](https://github.com/RebeccaStevens/deepmerge-ts/issues/94)

## [4.0.2](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.1...v4.0.2) (2022-03-31)


### Bug Fixes

* protect against prototype pollution ([d637db7](https://github.com/RebeccaStevens/deepmerge-ts/commit/d637db7e4fb2bfb113cb4bc1c85a125936d7081b))

## [4.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v4.0.0...v4.0.1) (2022-03-14)


### Bug Fixes

* **deno:** fix broken import in deno dist files ([#85](https://github.com/RebeccaStevens/deepmerge-ts/issues/85)) ([86faf2a](https://github.com/RebeccaStevens/deepmerge-ts/commit/86faf2a047488be2fbb1ff6a1edd005b5d4670cb))

# [4.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v3.0.1...v4.0.0) (2022-02-26)


### Bug Fixes

* improve meta data typings ([#61](https://github.com/RebeccaStevens/deepmerge-ts/issues/61)) ([9a881d3](https://github.com/RebeccaStevens/deepmerge-ts/commit/9a881d3e55762da03b0d0f465d7e958d81fd0958))


### Features

* allow for default merging via a special return value ([658d1fd](https://github.com/RebeccaStevens/deepmerge-ts/commit/658d1fd454fe095e6c7f2be22ccf4823fe0ea6ef))
* allow for implicit default merging ([1d5e617](https://github.com/RebeccaStevens/deepmerge-ts/commit/1d5e617bc4980f64a75fa9da1397979b2310fc06))
* allow for skipping properties completely via a special return value ([#64](https://github.com/RebeccaStevens/deepmerge-ts/issues/64)) ([676f2f6](https://github.com/RebeccaStevens/deepmerge-ts/commit/676f2f6593d6baf0e1b31f29c83bac7c392e7ce2))


### BREAKING CHANGES

* MetaMetaData now must extends DeepMergeBuiltInMetaData

## [3.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v3.0.0...v3.0.1) (2022-02-22)


### Bug Fixes

* allows readonly records in DeepMergeRecordsDefaultHKTInternalPropValueHelper ([#60](https://github.com/RebeccaStevens/deepmerge-ts/issues/60)) ([fc85dfa](https://github.com/RebeccaStevens/deepmerge-ts/commit/fc85dfa0cc579de127c8458e808f81cbca84d090))

# [3.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v2.0.1...v3.0.0) (2022-02-19)


### Code Refactoring

* unrequire unused types and values ([c78e373](https://github.com/RebeccaStevens/deepmerge-ts/commit/c78e3736fe725008b745a302233afacb2155db94))


### Features

* lone values will now be passed to mergeOthers rather than just returned ([#57](https://github.com/RebeccaStevens/deepmerge-ts/issues/57)) ([9c24584](https://github.com/RebeccaStevens/deepmerge-ts/commit/9c245846f8afbd8bc0fbe2a28626e6461f41ea53))
* provide customizable meta data to custom merge functions ([3d96692](https://github.com/RebeccaStevens/deepmerge-ts/commit/3d96692386c363e3f4250b267cac1d78231457ff)), closes [#33](https://github.com/RebeccaStevens/deepmerge-ts/issues/33)


### BREAKING CHANGES

* some types have changed for `deepmergeCustom`

## [2.0.1](https://github.com/RebeccaStevens/deepmerge-ts/compare/v2.0.0...v2.0.1) (2021-12-22)

# [2.0.0](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.7...v2.0.0) (2021-11-22)


### Bug Fixes

* add better support for readonly types ([#17](https://github.com/RebeccaStevens/deepmerge-ts/issues/17)) ([ee59064](https://github.com/RebeccaStevens/deepmerge-ts/commit/ee5906448bcc0fabef2a2b8e215d4c309d30b4db))


### BREAKING CHANGES

* interface DeepMergeMergeFunctionURItoKind's signature has changed

## [1.1.7](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.6...v1.1.7) (2021-11-22)


### Bug Fixes

* incorrect resulting type when merging 3+ readonly tuples ([#20](https://github.com/RebeccaStevens/deepmerge-ts/issues/20)) ([696a1b2](https://github.com/RebeccaStevens/deepmerge-ts/commit/696a1b21ce225e11e38ee9ef3b92a28cf3ed6a4c))

## [1.1.6](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.5...v1.1.6) (2021-11-22)


### Performance Improvements

* convert recursive types to tail-recursive versions ([#15](https://github.com/RebeccaStevens/deepmerge-ts/issues/15)) ([4401ac2](https://github.com/RebeccaStevens/deepmerge-ts/commit/4401ac2d1651093ab855d3d4bdf6c9628c0767ab))

## [1.1.5](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.4...v1.1.5) (2021-10-18)


### Bug Fixes

* **deno:** deno release fixup ([4b8ca98](https://github.com/RebeccaStevens/deepmerge-ts/commit/4b8ca9868de78228244b099dc2040c4cb16a649d))

## [1.1.4](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.3...v1.1.4) (2021-10-18)

## [1.1.3](https://github.com/RebeccaStevens/deepmerge-ts/compare/v1.1.2...v1.1.3) (2021-09-21)


### Bug Fixes

* order of package exports ([#12](https://github.com/RebeccaStevens/deepmerge-ts/issues/12)) ([4117460](https://github.com/RebeccaStevens/deepmerge-ts/commit/41174607ee57568f123e1a5661f635d5d54f7c0c))

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
