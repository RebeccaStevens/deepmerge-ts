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

  for (const currentObject of objects) {
    const stringKeys = Object.keys(currentObject);
    for (const stringKey of stringKeys) {
      keys.add(stringKey);
    }
    const symbols = Object.getOwnPropertySymbols(currentObject);
    // Fast path: skip symbol iteration when the object has no own symbols.
    if (symbols.length > 0) {
      for (const symbol of symbols) {
        if (Object.prototype.propertyIsEnumerable.call(currentObject, symbol)) {
          keys.add(symbol);
        }
      }
    }
  }

  return keys;
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
 * Does the given object appear to be a record.
 */
function isRecord(value: object): value is Record<PropertyKey, unknown> {
  // Fast path: Objects created via `{}` (whose prototype is `Object.prototype`)
  // or `Object.create(null)` (whose prototype is `null`) are plain records.
  // Assumes that standard plain objects do not have modified prototypes.
  const prototype: unknown = Object.getPrototypeOf(value);

  if (prototype === null || prototype === Object.prototype) {
    return true;
  }

  // All records are objects.
  const objectToString = Object.prototype.toString.call(value);
  if (objectToString !== "[object Object]" && objectToString !== "[object Module]") {
    return false;
  }

  const { constructor } = value;

  // If has modified constructor.
  // eslint-disable-next-line ts/no-unnecessary-condition
  if (constructor === undefined) {
    return true;
  }

  const constructorPrototype: unknown = constructor.prototype;

  // If has modified prototype.
  if (constructorPrototype === null || typeof constructorPrototype !== "object") {
    return false;
  }

  const constructorToString = Object.prototype.toString.call(constructorPrototype);
  if (constructorToString !== "[object Object]" && constructorToString !== "[object Module]") {
    return false;
  }

  // If constructor does not have an Object-specific method.
  if (!Object.hasOwn(constructorPrototype, "isPrototypeOf")) {
    return false;
  }

  // Most likely a record.
  return true;
}
