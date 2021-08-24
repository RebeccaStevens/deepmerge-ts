import { isPlainObject } from "is-plain-object";

import type { Property } from "./types";

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

  if (isPlainObject(object)) {
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
 * Get the keys of the given objects including symbol keys.
 *
 * Note: Only keys to enumerable properties are returned.
 *
 * @param objects - An array of objects to get the keys of.
 * @returns A set containing all the keys of all the given objects.
 */
export function getKeys(
  objects: Readonly<ReadonlyArray<object>>
): Set<Property> {
  return objects.reduce<Set<Property>>((mutableCarry, object) => {
    // eslint-disable-next-line functional/no-loop-statement -- using a loop here is more efficient.
    for (const key of [
      ...Object.getOwnPropertyNames(object),
      ...Object.getOwnPropertySymbols(object),
    ].filter((property) =>
      Object.prototype.propertyIsEnumerable.call(object, property)
    )) {
      mutableCarry.add(key);
    }

    return mutableCarry;
  }, new Set<Property>());
}

/**
 * Does the given object have the given property.
 *
 * @param object - The object to test.
 * @param property - The property to test.
 * @returns Whether the object has the property.
 */
export function objectHasProperty(object: object, property: Property): boolean {
  return typeof object === "object" && property in object;
}
