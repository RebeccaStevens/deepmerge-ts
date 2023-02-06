/**
 * Special values that tell deepmerge to perform a certain action.
 */
export const actions = {
  defaultMerge: Symbol("deepmerge-ts: default merge"),
  skip: Symbol("deepmerge-ts: skip"),
} as const;

/**
 * Special values that tell deepmergeInto to perform a certain action.
 */
export const actionsInto = {
  defaultMerge: actions.defaultMerge,
} as const;
