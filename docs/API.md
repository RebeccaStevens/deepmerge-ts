# API

## deepmerge(x, y, ...)

Merges the given inputs together using the default configuration.

### deepmerge(...inputs)

Merges the array of inputs together using the default configuration.

Note: If `inputs` isn't typed as a tuple then we cannot determine the output type. The output type will simply be `unknown`.

## deepmergeCustom(options[, rootMetaData])

Generate a customized deepmerge function using the given options. The returned function works just like `deepmerge` except it uses the customized configuration.

### options

The following options can be used to customize the deepmerge function.\
All these options are optional.

#### `mergeRecords`

Type: `false | (values: Record<any, unknown>[], utils: DeepMergeMergeFunctionUtils, meta: MetaData) => unknown`

If false, records won't be merged. If set to a function, that function will be used to merge records.

Note: Records are "vanilla" objects (e.g. `{ foo: "hello", bar: "world" }`).

#### `mergeArrays`

Type: `false | (values: unknown[][], utils: DeepMergeMergeFunctionUtils, meta: MetaData) => unknown`

If false, arrays won't be merged. If set to a function, that function will be used to merge arrays.

#### `mergeMaps`

Type: `false | (values: Map<unknown, unknown>[], utils: DeepMergeMergeFunctionUtils, meta: MetaData) => unknown`

If false, maps won't be merged. If set to a function, that function will be used to merge maps.

#### `mergeSets`

Type: `false | (values: Set<unknown>[], utils: DeepMergeMergeFunctionUtils, meta: MetaData) => unknown`

If false, sets won't be merged. If set to a function, that function will be used to merge sets.

#### `mergeOthers`

Type: `(values: Set<unknown>[], utils: DeepMergeMergeFunctionUtils, meta: MetaData) => unknown`

If set to a function, that function will be used to merge everything else.

Note: This includes merging mixed types, such as merging a map with an array.

### `rootMetaData`

Type: `MetaData`

The given meta data value will be passed to root level merges.

### DeepMergeMergeFunctionUtils

This is a set of utility functions that are made available to your custom merge functions.

#### `mergeFunctions`

These are all the merge function being used to perform the deepmerge.\
These will be the custom merge functions you gave, or the default merge functions for options you didn't customize.

#### `defaultMergeFunctions`

These are all the merge functions that the default, non-customize deepmerge function uses.

#### `deepmerge`

This is your top level customized deepmerge function.

Note: Be careful when calling this as it is really easy to end up in an infinite loop.
