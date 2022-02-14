# Deepmerge Custom

`deepmergeCustom` allows you to customize the deepmerge function. It is a higher-order function; that is to say it returns a new customized deepmerge function.

## Customizing the return type

If you want to customize the deepmerge function, you probably also want the return type of the result to be correct too.\
Unfortunately however, due to TypeScript limitations, we can not automatically infer this.
In order to get the correct return type, you need to provide us with type information about how you have customized the function (we do the very same to define the default configuration).

We need to use HKTs (higher-kinded types) in order to generate the right output type. But again, unfortunately, TypeScript does not support HKTs. Luckily however, there is a workaround.
To use HKTs, we alias the type to a string type (a URI) and simply refer to that type by its alias until we need to resolve it.

Here's a simple example that creates a custom deepmerge function that does not merge arrays.

```js
import type { DeepMergeLeafURI } from "deepmerge-ts";
import { deepmergeCustom } from "deepmerge-ts";

const customDeepmerge = deepmergeCustom<{
  DeepMergeArraysURI: DeepMergeLeafURI; // <-- Needed for correct output type.
}>({
  mergeArrays: false,
});

const x = { foo: [1, 2], bar: [3, 4] };
const y = { foo: [5, 6] };

customDeepmerge(x, y); // => { foo: [5, 6], bar: [3, 4] }
```

When resolving a HKT, we use a lookup inside an interface called `DeepMergeMergeFunctionURItoKind`.
This interface needs to contain all the mappings of the URIs to their actual type.

When defining your own HKT for use with deepmerge, you need to extend this interface with your mapping.
This can be done using [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) by declaring a module block for this library and defining the same interface.

```ts
declare module "deepmerge-ts" {
  interface DeepMergeMergeFunctionURItoKind<Ts extends ReadonlyArray<unknown>, MF extends DeepMergeMergeFunctionsURIs> {
    readonly MyCustomMergeURI: MyValue;
  }
}
```

Here's an example of creating a custom deepmerge function that amalgamates dates into an array.

```ts
import type { DeepMergeLeaf, DeepMergeMergeFunctionURItoKind, DeepMergeMergeFunctionsURIs } from "deepmerge-ts";
import { deepmergeCustom } from "deepmerge-ts";

const customizedDeepmerge = deepmergeCustom<{
  DeepMergeOthersURI: "MyDeepMergeDatesURI"; // <-- Needed for correct output type.
}>({
  mergeOthers: (values, utils) => {
    // If every value is a date, the return the amalgamated array.
    if (values.every((value) => value instanceof Date)) {
      return values;
    }
    // Otherwise, use the default merging strategy.
    return utils.defaultMergeFunctions.mergeOthers(values, utils);
  },
});

const x = { foo: new Date("2020-01-01") };
const y = { foo: new Date("2021-02-02") };
const z = { foo: new Date("2022-03-03") };

customDeepmerge(x, y, z); // => { foo: [Date, Date, Date] }

declare module "deepmerge-ts" {
  interface DeepMergeMergeFunctionURItoKind<
    Ts extends ReadonlyArray<unknown>,
    MF extends DeepMergeMergeFunctionsURIs
  > {
    readonly MyDeepMergeDatesURI: EveryIsDate<Ts> extends true ? Ts : DeepMergeLeaf<Ts>;
  }
}

type EveryIsDate<Ts extends ReadonlyArray<unknown>> = Ts extends readonly [infer Head, ...infer Rest]
  ? Head extends Date
    ? EveryIsDate<Rest>
    : false
  : true;
```

Note: If you want to use HKTs in your own project, not related to deepmerge-ts, we recommend checking out [fp-ts](https://gcanti.github.io/fp-ts/modules/HKT.ts.html).

## API

[See deepmerge custom API](./API.md#deepmergecustomoptions).
