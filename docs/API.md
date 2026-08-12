# API

## deepmerge(x, y, ...)

Merges the given inputs together using the default configuration.

Note: If the inputs aren't statically typed as a tuple (for example, when spreading an array), TypeScript cannot
determine the output type and it will be inferred as `unknown`.

## deepmergeInto(target, value, ...)

Mutate the target by merging the other inputs into it using the default configuration.

## deepmergeCustom(options[, rootMetaData])

Generate a customized `deepmerge` function using the given options. The returned function works just like `deepmerge`
except it uses the customized configuration.

### options

The following options can be used to customize the deepmerge function.\
All these options are optional.

#### `mergeRecords`

Type: `false | (values: Record<PropertyKey, unknown>[], utils: DeepMergeUtils, meta: DeepMergeBuiltInMetaData) => unknown`

If `false`, records won't be merged. If set to a function, that function will be used to merge records.

Note: Records are "vanilla" objects (e.g. `{ foo: "hello", bar: "world" }`).

#### `mergeArrays`

Type: `false | (values: unknown[][], utils: DeepMergeUtils, meta: DeepMergeBuiltInMetaData) => unknown`

If `false`, arrays won't be merged. If set to a function, that function will be used to merge arrays.

#### `mergeMaps`

Type: `false | (values: Map<unknown, unknown>[], utils: DeepMergeUtils, meta: DeepMergeBuiltInMetaData) => unknown`

If `false`, maps won't be merged. If set to a function, that function will be used to merge maps.

#### `mergeSets`

Type: `false | (values: Set<unknown>[], utils: DeepMergeUtils, meta: DeepMergeBuiltInMetaData) => unknown`

If `false`, sets won't be merged. If set to a function, that function will be used to merge sets.

#### `mergeCircularReferences`

Type: `false | (values: unknown[], cyclicDepths: number[], utils: DeepMergeUtils, meta: DeepMergeBuiltInMetaData) => unknown` <!-- markdownlint-disable-line MD013 -->

If `false`, circular references won't be resolved. If set to a function, that function will be used to merge
circular references.

#### `mergeOthers`

Type: `(values: unknown[], utils: DeepMergeUtils, meta: DeepMergeBuiltInMetaData) => unknown`

If set to a function, that function will be used to merge everything else.

Note: This includes merging mixed types, such as merging a map with an array.

#### `enableImplicitDefaultMerging`

Type: `boolean`

If `true`, returning `undefined` from a custom merge function will implicitly fallback to default merging.

#### `filterValues`

Type: `false | (values: unknown[], meta: DeepMergeBuiltInMetaData) => unknown[]`

If `false`, no values will be filtered out. If set to a function, that function will be used to filter values.
By default, `undefined` values will be filtered out (`null` values will be kept).

#### `maxDepth`

Type: `number`

The maximum recursion depth to merge to (defaults to `1000`). Prevents stack exhaustion when merging untrusted input.

#### `metaDataUpdater`

Type: `(previousMeta: DeepMergeBuiltInMetaData | undefined, metaMeta: Readonly<Partial<DeepMergeMetaMetaData>>) => DeepMergeBuiltInMetaData` <!-- markdownlint-disable-line MD013 -->

A function used to generate/update metadata passed down the merge tree.

### `rootMetaData`

Type: `DeepMergeBuiltInMetaData`

The given meta data value will be passed to root level merges.

### DeepMergeUtils

This is a set of utility functions that are made available to your custom merge functions.

#### `mergeFunctions`

These are all the merge functions being used to perform the deepmerge.\
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

#### `filterValues`

The function used to filter values, if configured.

#### `maxDepth`

The configured maximum recursion depth limit.

#### `actions`

Contains symbols that can be used to tell `deepmerge-ts` to perform a special action. `actions.defaultMerge` falls back
to the default merge behavior; `actions.skip` skips merging the current value.

## deepmergeIntoCustom(options[, rootMetaData])

Generate a customized `deepmergeInto` function using the given options. The returned function works just like
`deepmergeInto` except it uses the customized configuration.

### options

The following options can be used to customize the deepmerge function.\
All these options are optional.

#### `mergeRecords`

Type: `false | (target: DeepMergeValueReference<Record<PropertyKey, unknown>>, values: Record<PropertyKey, unknown>[], utils: DeepMergeIntoUtils, meta: DeepMergeBuiltInMetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If `false`, records won't be merged. If set to a function, that function will be used to merge records by mutating
`target.value`.

Note: Records are "vanilla" objects (e.g. `{ foo: "hello", bar: "world" }`).

#### `mergeArrays`

Type: `false | (target: DeepMergeValueReference<unknown[]>, values: unknown[][], utils: DeepMergeIntoUtils, meta: DeepMergeBuiltInMetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If `false`, arrays won't be merged. If set to a function, that function will be used to merge arrays by mutating
`target.value`.

#### `mergeMaps`

Type: `false | (target: DeepMergeValueReference<Map<unknown, unknown>>, values: Map<unknown, unknown>[], utils: DeepMergeIntoUtils, meta: DeepMergeBuiltInMetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If `false`, maps won't be merged. If set to a function, that function will be used to merge maps by mutating
`target.value`.

#### `mergeSets`

Type: `false | (target: DeepMergeValueReference<Set<unknown>>, values: Set<unknown>[], utils: DeepMergeIntoUtils, meta: DeepMergeBuiltInMetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If `false`, sets won't be merged. If set to a function, that function will be used to merge sets by mutating
`target.value`.

#### `mergeCircularReferences`

Type: `false | (target: DeepMergeValueReference<unknown>, values: object[], utils: DeepMergeIntoUtils, meta: DeepMergeBuiltInMetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If `false`, circular references won't be resolved. If set to a function, that function will be used to merge
circular references by mutating `target.value`.

#### `mergeOthers`

Type: `(target: DeepMergeValueReference<unknown>, values: unknown[], utils: DeepMergeIntoUtils, meta: DeepMergeBuiltInMetaData) => void | symbol` <!-- markdownlint-disable-line MD013 -->

If set to a function, that function will be used to merge everything else by mutating `target.value`.

Note: This includes merging mixed types, such as merging a map with an array.

#### `filterValues`

Type: `false | (values: unknown[], meta: DeepMergeBuiltInMetaData) => unknown[]`

If `false`, no values will be filtered out. If set to a function, that function will be used to filter values.
By default, `undefined` values will be filtered out (`null` values will be kept).

#### `maxDepth`

Type: `number`

The maximum recursion depth to merge to (defaults to `1000`). Prevents stack exhaustion when merging untrusted input.

#### `metaDataUpdater`

Type: `(previousMeta: DeepMergeBuiltInMetaData | undefined, metaMeta: Readonly<Partial<DeepMergeMetaMetaData>>) => DeepMergeBuiltInMetaData` <!-- markdownlint-disable-line MD013 -->

A function used to generate/update metadata passed down the merge tree.

### `rootMetaData`

Type: `DeepMergeBuiltInMetaData`

The given meta data value will be passed to root level merges.

### DeepMergeIntoUtils

This is a set of utility functions that are made available to your custom merge functions.

#### `mergeFunctions`

These are all the merge functions being used to perform the deepmerge.\
These will be the custom merge functions you gave, or the default merge functions for options you didn't customize.

#### `defaultMergeFunctions`

These are all the merge functions that the default, non-customized `deepmergeInto` function uses.

#### `metaDataUpdater`

This function is used to update the meta data. Call it with the new meta data when/where applicable.

#### `deepmergeInto`

This is your top level customized `deepmergeInto` function.

Note: Be careful when calling this as it is really easy to end up in an infinite loop.

#### `filterValues`

The function used to filter values, if configured.

#### `maxDepth`

The configured maximum recursion depth limit.

#### `actions`

Contains symbols that can be used to tell `deepmerge-ts` to perform a special action. Only `actions.defaultMerge` is
available, which falls back to the default merge behavior.

## High-Performance "FastUnsafe" Variants

For performance-critical code where input is trusted and non-circular, we provide high-performance variants:

- `deepmergeFastUnsafe(x, y, ...)`
- `deepmergeFastUnsafeCustom(options)`
- `deepmergeIntoFastUnsafe(target, value, ...)`
- `deepmergeIntoFastUnsafeCustom(options)`

`deepmergeFastUnsafeCustom` and `deepmergeIntoFastUnsafeCustom` accept the same options as `deepmergeCustom` and
`deepmergeIntoCustom`, except `metaDataUpdater`, `maxDepth`, and `mergeCircularReferences` are not available (they
don't apply to the fast variants). Their option types are `DeepMergeFastUnsafeOptions` and
`DeepMergeIntoFastUnsafeOptions` respectively.

### Differences from Standard Versions

- **No circular reference detection:** Does not track object hierarchies or detect cyclic references. Circular
  structures will result in a stack overflow.
- **No recursion depth limits:** Does not enforce a `maxDepth` limit (standard versions default to 1000).
- **No metadata tracking:** Metadata updates and custom metadata tracking are bypassed, avoiding metadata object
  allocations.
- **No prototype pollution interception:** Assumes trusted data and directly assigns properties.

> [!WARNING]
> Only use these functions with **trusted, non-circular data**. Using them with untrusted user data can lead to
> serious security vulnerabilities:
>
> - **Prototype pollution:** Prototype pollution safeguards are omitted for speed; malicious keys like `__proto__` can
>   pollute object prototypes.
> - **Denial of Service (DoS):** Circular reference detection and recursion depth limits are disabled; cyclic or
>   deeply nested input will cause infinite recursion and crash via stack overflow.

## Utility Functions

The following utilities are also exported for use in custom merge functions.

### `getKeys(objects)`

Returns a `Set` of all enumerable keys (including symbol keys) of all the given objects.

Deprecated: Use `getKeysOfObjects` instead.

### `getKeysOfObjects(objects)`

Returns a `Set` of all enumerable keys (including symbol keys) of all the given objects.

### `getObjectType(value)`

Returns the `ObjectType` of the given value.

### `objectHasProperty(object, property)`

Returns whether the given object has the given property.

### `ObjectType`

An enum of the object types `deepmerge` distinguishes between: `NOT`, `RECORD`, `ARRAY`, `SET`, `MAP`, and `OTHER`.

## Exported Types

The following types are exported for convenience.

- `DeepMergeOptions` & `DeepMergeIntoOptions` — The options accepted by `deepmergeCustom` and `deepmergeIntoCustom`.
- `DeepMergeFastUnsafeOptions` & `DeepMergeIntoFastUnsafeOptions` — The options accepted by the fast-unsafe variants.
- `DeepMergeUtils` & `DeepMergeIntoUtils` — The utils passed to custom merge functions.
- `DeepMergeFastUnsafeUtils` & `DeepMergeIntoFastUnsafeUtils` — The utils passed to fast-unsafe merge functions.
- `DeepMergeMetaData` & `DeepMergeMetaMetaData` & `DeepMergeBuiltInMetaData` — Types related to the merge metadata.
- `DeepMergeFunctionsDefaults` & `DeepMergeIntoFunctionsDefaults` — The default merge functions.
- `DeepMergeFunctionsDefaultsFastUnsafe` & `DeepMergeIntoFunctionsDefaultsFastUnsafe` — The default fast-unsafe merge
  functions.
- `DeepMergeValueReference` — Wraps the value being merged into (`{ value: T }`).
- `FilterOut` — A utility type that removes a given type from a tuple.
- `ObjectType` — See [Utility Functions](#utility-functions).

The higher-kinded types used to customize return types (such as `DeepMergeHKT`, `DeepMergeLeaf`, `DeepMergeLeafURI`,
`DeepMergeFunctionsURIs`, and `DeepMergeNoFilteringURI`) are used in the
[custom merge docs](./deepmergeCustom.md#customizing-the-return-type).
