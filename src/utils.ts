import type { HierarchyValue } from "./types/merging.ts";

/**
 * The different types of objects deepmerge-ts support.
 */
export const enum ObjectType {
  NOT,
  RECORD,
  ARRAY,
  SET,
  MAP,
  OTHER,
}

/**
 * Get the type of the given object.
 *
 * @param object - The object to get the type of.
 * @returns The type of the given object.
 */
export function getObjectType(object: unknown): ObjectType {
  if (typeof object !== "object" || object === null) {
    return ObjectType.NOT;
  }

  if (Array.isArray(object)) {
    return ObjectType.ARRAY;
  }

  if (isRecord(object)) {
    return ObjectType.RECORD;
  }

  if (object instanceof Set) {
    return ObjectType.SET;
  }

  if (object instanceof Map) {
    return ObjectType.MAP;
  }

  return ObjectType.OTHER;
}

/**
 * Get the keys of the given object(s) including symbol keys.
 * If an array is given, the keys of all the objects within the array are returned.
 *
 * Note: Only keys to enumerable properties are returned.
 *
 * @deprecated Use `getKeysOfObjects` instead.
 * @param objects - An array of objects to get the keys of.
 * @returns A set containing all the keys of all the given objects.
 */
export const getKeys = getKeysOfObjects;

/**
 * Get the keys of the given objects including symbol keys.
 *
 * Note: Only keys to enumerable properties are returned.
 *
 * @param objects - An array of objects to get the keys of.
 * @returns A set containing all the keys of all the given objects.
 */
export function getKeysOfObjects(objects: ReadonlyArray<object>): Set<PropertyKey> {
  const keys = new Set<PropertyKey>();

  for (const object of objects) {
    for (const key of getKeysOfObject(object)) {
      keys.add(key);
    }
  }

  return keys;
}

/**
 * Get the keys of the given object.
 */
export function getKeysOfObject(object: object): PropertyKey[] {
  return [...Object.keys(object), ...Object.getOwnPropertySymbols(object)];
}

/**
 * Does the given object have the given property.
 *
 * @param object - The object to test.
 * @param property - The property to test.
 * @returns Whether the object has the property.
 */
export function objectHasProperty(object: object, property: PropertyKey): boolean {
  return typeof object === "object" && Object.prototype.propertyIsEnumerable.call(object, property);
}

/**
 * Get an iterable object that iterates over the given iterables.
 */
export function getIterableOfIterables<T>(iterables: ReadonlyArray<Readonly<Iterable<T>>>): Iterable<T> {
  let mut_iterablesIndex = 0;
  let mut_iterator = iterables[0]?.[Symbol.iterator]();

  return {
    [Symbol.iterator](): Iterator<T, void> {
      return {
        next(): IteratorResult<T, void> {
          do {
            if (mut_iterator === undefined) {
              return { done: true, value: undefined };
            }

            const result = mut_iterator.next();
            if (result.done === true) {
              mut_iterablesIndex += 1;
              mut_iterator = iterables[mut_iterablesIndex]?.[Symbol.iterator]();
              continue;
            }

            return {
              done: false,
              value: result.value,
            };
          } while (true);
        },
      };
    },
  };
}

// eslint-disable-next-line unicorn/prefer-set-has -- Array is more performant for a low number of elements.
const validRecordToStringValues = ["[object Object]", "[object Module]"];

/**
 * Does the given object appear to be a record.
 */
function isRecord(value: object): value is Record<PropertyKey, unknown> {
  // All records are objects.
  if (!validRecordToStringValues.includes(Object.prototype.toString.call(value))) {
    return false;
  }

  const { constructor } = value;

  // If has modified constructor.
  // eslint-disable-next-line ts/no-unnecessary-condition
  if (constructor === undefined) {
    return true;
  }

  const prototype: unknown = constructor.prototype;

  // If has modified prototype.
  if (
    prototype === null ||
    typeof prototype !== "object" ||
    !validRecordToStringValues.includes(Object.prototype.toString.call(prototype))
  ) {
    return false;
  }

  // If constructor does not have an Object-specific method.
  // eslint-disable-next-line no-prototype-builtins
  if (!prototype.hasOwnProperty("isPrototypeOf")) {
    return false;
  }

  // Most likely a record.
  return true;
}

/**
 * If the given object is a cyclic reference in its ancestor tree, return how far down the ancestor tree the object is from it's first occurrence. Otherwise, return 0.
 *
 * @param object - The object to check.
 * @param hierarchy - The hierarchy of the object.
 * @param index - The index of the object (or ancestor of) within the original values passed to the merge function.
 * @returns The cyclic reference depth of the object if it is a cyclic reference, or 0 if it is not.
 */
export function getCyclicReferenceDepth(
  object: unknown,
  hierarchy: ReadonlyArray<HierarchyValue> | undefined,
  index: number,
): number {
  // If their is no hierarchy, then there can be no cyclic reference.
  if (hierarchy === undefined || hierarchy.length === 0) {
    return 0;
  }

  let mut_depth = 1;

  // Check if the child is an ancestor of itself.
  for (let mut_index = hierarchy.length - 1; mut_index >= 0; mut_index--) {
    const parent = hierarchy[mut_index]!.parents[index];
    if (object === parent) {
      return mut_depth;
    }
    mut_depth += 1;
  }

  return 0;
}
