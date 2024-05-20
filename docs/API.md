# API

## deepmerge(x, y, ...)

Merges the given inputs together using the default configuration.

### deepmerge(...inputs)

Merges the array of inputs together using the default configuration.

Note: If `inputs` isn't typed as a tuple then we cannot determine the output type. The output type will simply be
`unknown`.

## deepmergeInto(target, value, ...)

Mutate the target by merging the other inputs into it using the default configuration.

## deepmergeCustom(options[, rootMetaData])

Generate a customized `deepmerge` function using the given options. The returned function works just like `deepmerge`
except it uses the customized configuration.

### options

The following options can be used to customize the deepmerge function.\
All these options are optional.

#### `mergeRecords`

Type: `false | (values: Record<any, unknown>[], utils: DeepMergeUtils, meta: MetaData) => unknown`

If `false`, records won't be merged. If set to a function, that function will be used to merge records.

Note: Records are "vanilla" objects (e.g. `{ foo: "hello", bar: "world" }`).

#### `mergeArrays`

Type: `false | (values: unknown[][], utils: DeepMergeUtils, meta: MetaData) => unknown`

If `false`, arrays won't be merged. If set to a function, that function will be used to merge arrays.

#### `mergeMaps`

Type: `false | (values: Map<unknown, unknown>[], utils: DeepMergeUtils, meta: MetaData) => unknown`

If `false`, maps won't be merged. If set to a function, that function will be used to merge maps.

#### `mergeSets`

Type: `false | (values: Set<unknown>[], utils: DeepMergeUtils, meta: MetaData) => unknown`

If `false`, sets won't be merged. If set to a function, that function will be used to merge sets.

#### `mergeOthers`

Type: `(values: unknown[], utils: DeepMergeUtils, meta: MetaData) => unknown`

If set to a function, that function will be used to merge everything else.

Note: This includes merging mixed types, such as merging a map with an array.

#### `filterValues`

Type: `false | (values: unknown[], meta: MetaData) => unknown[]`

If `false`, no values will be filter out. If set to a function, that function will be used to filter values.
By default, `undefined` values will be filtered out (`null` values will be kept).

### `rootMetaData`

Type: `MetaData`

The given meta data value will be passed to root level merges.

### DeepMergeUtils

This is a set of utility functions that are made available to your custom merge functions.

#### `mergeFunctions`

These are all the merge function being used to perform the deepmerge.\
These will be the custom merge functions you gave, or the default merge functions for options you didn't customize.

#### `defaultMergeFunctions`

These are all the merge functions that the default, non-customized `deepmerge` function uses.

#### `metaDataUpdater`

This function is used to update the meta data. Call it with the new meta data when/where applicable.

#### `deepmerge`

This is your top level customized `deepmerge` function.

Note: Be careful when calling this as it is really easy to end up in an infinite loop.

#### `useImplicitDefaultMerging`

States whether or not implicit default merging is in use.

#### `actions`

Contains symbols that can be used to tell `deepmerge-ts` to perform a special action.

## deepmergeIntoCustom(options[, rootMetaData])

Generate a customized `deepmergeInto` function using the given options. The returned function works just like
`deepmergeInto` except it uses the customized configuration.

### options

The following options can be used to customize the deepmerge function.\
All these options are optional.

#### `mergeRecords`

Type: `false | (target: DeepMergeValueReference<Record<PropertyKey, unknown>>, values: Record<any, unknown>[], utils: DeepMergeUtils, meta: MetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If `false`, records won't be merged. If set to a function, that function will be used to merge records by mutating
`target.value`.

Note: Records are "vanilla" objects (e.g. `{ foo: "hello", bar: "world" }`).

#### `mergeArrays`

Type: `false | (target: DeepMergeValueReference<unknown[]>, values: unknown[][], utils: DeepMergeIntoFunctionUtils, meta: MetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If `false`, arrays won't be merged. If set to a function, that function will be used to merge arrays by mutating
`target.value`.

#### `mergeMaps`

Type: `false | (target: DeepMergeValueReference<Map<unknown, unknown>>, values: Map<unknown, unknown>[], utils: DeepMergeIntoFunctionUtils, meta: MetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If `false`, maps won't be merged. If set to a function, that function will be used to merge maps by mutating
`target.value`.

#### `mergeSets`

Type: `false | (target: DeepMergeValueReference<Set<unknown>>, values: Set<unknown>[], utils: DeepMergeIntoFunctionUtils, meta: MetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If `false`, sets won't be merged. If set to a function, that function will be used to merge sets by mutating
`target.value`.

#### `mergeOthers`

Type: `(target: DeepMergeValueReference<unknown>, values: unknown[], utils: DeepMergeIntoFunctionUtils, meta: MetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If set to a function, that function will be used to merge everything else by mutating `target.value`.

Note: This includes merging mixed types, such as merging a map with an array.

#### `filterValues`

Type: `false | (values: unknown[], meta: MetaData) => unknown[]`

If `false`, no values will be filter out. If set to a function, that function will be used to filter values.
By default, `undefined` values will be filtered out (`null` values will be kept).

### `rootMetaData`

Type: `MetaData`

The given meta data value will be passed to root level merges.

### DeepMergeIntoFunctionUtils

This is a set of utility functions that are made available to your custom merge functions.

#### `mergeFunctions`

These are all the merge function being used to perform the deepmerge.\
These will be the custom merge functions you gave, or the default merge functions for options you didn't customize.

#### `defaultMergeFunctions`

These are all the merge functions that the default, non-customized `deepmerge` function uses.

#### `metaDataUpdater`

This function is used to update the meta data. Call it with the new meta data when/where applicable.

#### `deepmergeInto`

This is your top level customized `deepmergeInto` function.

Note: Be careful when calling this as it is really easy to end up in an infinite loop.

#### `actions`

Contains symbols that can be used to tell `deepmerge-ts` to perform a special action.
