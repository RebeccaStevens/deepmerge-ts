export function areAllNumbers(
  values: ReadonlyArray<unknown>
): values is ReadonlyArray<number> {
  return values.every((value) => typeof value === "number");
}

export function hasProp<T, K extends PropertyKey>(
  value: T,
  prop: K
): value is T & Record<K, unknown> {
  return typeof value === "object" && value !== null && prop in value;
}
