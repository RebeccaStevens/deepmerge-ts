import { isPlainObject } from 'is-plain-object';

/**
 * Get the type of the given object.
 *
 * @param object - The object to get the type of.
 * @returns The type of the given object.
 */
function getObjectType(object) {
    if (typeof object !== "object" || object === null) {
        return 0 /* NOT */;
    }
    if (Array.isArray(object)) {
        return 2 /* ARRAY */;
    }
    if (isPlainObject(object)) {
        return 1 /* RECORD */;
    }
    if (object instanceof Set) {
        return 3 /* SET */;
    }
    if (object instanceof Map) {
        return 4 /* MAP */;
    }
    return 5 /* OTHER */;
}
/**
 * Get the keys of the given objects including symbol keys.
 *
 * Note: Only keys to enumerable properties are returned.
 *
 * @param objects - An array of objects to get the keys of.
 * @returns A set containing all the keys of all the given objects.
 */
function getKeys(objects) {
    const keys = new Set();
    /* eslint-disable functional/no-loop-statement -- using a loop here is more efficient. */
    for (const object of objects) {
        for (const key of [
            ...Object.keys(object),
            ...Object.getOwnPropertySymbols(object),
        ]) {
            keys.add(key);
        }
    }
    /* eslint-enable functional/no-loop-statement */
    return keys;
}
/**
 * Does the given object have the given property.
 *
 * @param object - The object to test.
 * @param property - The property to test.
 * @returns Whether the object has the property.
 */
function objectHasProperty(object, property) {
    return (typeof object === "object" &&
        Object.prototype.propertyIsEnumerable.call(object, property));
}
/**
 * Get an iterable object that iterates over the given iterables.
 */
function getIterableOfIterables(iterables) {
    return {
        *[Symbol.iterator]() {
            // eslint-disable-next-line functional/no-loop-statement
            for (const iterable of iterables) {
                // eslint-disable-next-line functional/no-loop-statement
                for (const value of iterable) {
                    yield value;
                }
            }
        },
    };
}

const defaultOptions = {
    mergeMaps,
    mergeSets,
    mergeArrays,
    mergeRecords,
    mergeOthers: leaf,
};
/**
 * Deeply merge objects.
 *
 * @param objects - The objects to merge.
 */
function deepmerge(...objects) {
    return deepmergeCustom({})(...objects);
}
/**
 * Deeply merge two or more objects using the given options.
 *
 * @param options - The options on how to customize the merge function.
 */
function deepmergeCustom(options) {
    const utils = getUtils(options, customizedDeepmerge);
    /**
     * The customized deepmerge function.
     */
    function customizedDeepmerge(...objects) {
        if (objects.length === 0) {
            return undefined;
        }
        if (objects.length === 1) {
            return objects[0];
        }
        return mergeUnknowns(objects, utils);
    }
    return customizedDeepmerge;
}
/**
 * The the full options with defaults apply.
 *
 * @param options - The options the user specified
 */
function getUtils(options, customizedDeepmerge) {
    return {
        defaultMergeFunctions: defaultOptions,
        mergeFunctions: {
            ...defaultOptions,
            ...Object.fromEntries(Object.entries(options).map(([key, option]) => option === false ? [key, leaf] : [key, option])),
        },
        deepmerge: customizedDeepmerge,
    };
}
/**
 * Merge unknown things.
 *
 * @param values - The values.
 */
function mergeUnknowns(values, utils) {
    const type = getObjectType(values[0]);
    // eslint-disable-next-line functional/no-conditional-statement -- add an early escape for better performance.
    if (type !== 0 /* NOT */ && type !== 5 /* OTHER */) {
        // eslint-disable-next-line functional/no-loop-statement -- using a loop here is more performant than mapping every value and then testing every value.
        for (let mutableIndex = 1; mutableIndex < values.length; mutableIndex++) {
            if (getObjectType(values[mutableIndex]) === type) {
                continue;
            }
            return utils.mergeFunctions.mergeOthers(values, utils);
        }
    }
    switch (type) {
        case 1 /* RECORD */:
            return utils.mergeFunctions.mergeRecords(values, utils);
        case 2 /* ARRAY */:
            return utils.mergeFunctions.mergeArrays(values, utils);
        case 3 /* SET */:
            return utils.mergeFunctions.mergeSets(values, utils);
        case 4 /* MAP */:
            return utils.mergeFunctions.mergeMaps(values, utils);
        default:
            return utils.mergeFunctions.mergeOthers(values, utils);
    }
}
/**
 * Merge records.
 *
 * @param values - The records.
 */
function mergeRecords(values, utils) {
    const result = {};
    /* eslint-disable functional/no-loop-statement, functional/no-conditional-statement -- using a loop here is more performant. */
    for (const key of getKeys(values)) {
        const propValues = [];
        for (const value of values) {
            if (objectHasProperty(value, key)) {
                propValues.push(value[key]);
            }
        }
        // assert(propValues.length > 0);
        result[key] =
            propValues.length === 1
                ? propValues[0]
                : mergeUnknowns(propValues, utils);
    }
    /* eslint-enable functional/no-loop-statement, functional/no-conditional-statement */
    return result;
}
/**
 * Merge arrays.
 *
 * @param values - The arrays.
 */
function mergeArrays(values, utils) {
    return values.flat();
}
/**
 * Merge sets.
 *
 * @param values - The sets.
 */
function mergeSets(values, utils) {
    return new Set(getIterableOfIterables(values));
}
/**
 * Merge maps.
 *
 * @param values - The maps.
 */
function mergeMaps(values, utils) {
    return new Map(getIterableOfIterables(values));
}
/**
 * Merge "other" things.
 *
 * @param values - The values.
 */
function leaf(values, utils) {
    return values[values.length - 1];
}

export { deepmerge, deepmergeCustom };
