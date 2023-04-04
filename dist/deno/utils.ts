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
 * Get the keys of the given objects including symbol keys.
 *
 * Note: Only keys to enumerable properties are returned.
 *
 * @param objects - An array of objects to get the keys of.
 * @returns A set containing all the keys of all the given objects.
 */
export function getKeys(objects: ReadonlyArray<object>): Set<PropertyKey> {
  const keys = new Set<PropertyKey>();

  /* eslint-disable functional/no-loop-statements, functional/no-expression-statements -- using a loop here is more efficient. */
  for (const object of objects) {
    for (const key of [
      ...Object.keys(object),
      ...Object.getOwnPropertySymbols(object),
    ]) {
      keys.add(key);
    }
  }
  /* eslint-enable functional/no-loop-statements, functional/no-expression-statements */

  return keys;
}

/**
 * Does the given object have the given property.
 *
 * @param object - The object to test.
 * @param property - The property to test.
 * @returns Whether the object has the property.
 */
export function objectHasProperty(
  object: object,
  property: PropertyKey
): boolean {
  return (
    typeof object === "object" &&
    Object.prototype.propertyIsEnumerable.call(object, property)
  );
}

/**
 * Get an iterable object that iterates over the given iterables.
 */
export function getIterableOfIterables<T>(
  iterables: ReadonlyArray<Readonly<Iterable<T>>>
): Iterable<T> {
  return {
    // eslint-disable-next-line functional/functional-parameters
    *[Symbol.iterator]() {
      // eslint-disable-next-line functional/no-loop-statements
      for (const iterable of iterables) {
        // eslint-disable-next-line functional/no-loop-statements
        for (const value of iterable) {
          yield value;
        }
      }
    },
  };
}

const validRecordToStringValues = new Set([
  "[object Object]",
  "[object Module]",
]);

/**
 * Does the given object appear to be a record.
 */
function isRecord(value: object): value is Record<PropertyKey, unknown> {
  // All records are objects.
  if (!validRecordToStringValues.has(Object.prototype.toString.call(value))) {
    return false;
  }

  const { constructor } = value;

  // If has modified constructor.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (constructor === undefined) {
    return true;
  }

  // eslint-disable-next-line prefer-destructuring
  const prototype: unknown = constructor.prototype;

  // If has modified prototype.
  if (
    prototype === null ||
    typeof prototype !== "object" ||
    !validRecordToStringValues.has(Object.prototype.toString.call(prototype))
  ) {
    return false;
  }

  // If constructor does not have an Object-specific method.
  // eslint-disable-next-line sonarjs/prefer-single-boolean-return, no-prototype-builtins
  if (!prototype.hasOwnProperty("isPrototypeOf")) {
    return false;
  }

  // Most likely a record.
  return true;
}
