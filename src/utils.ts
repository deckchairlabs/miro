export function notEmpty<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

export function undefinedOr<T>(value: T | undefined, defaultValue: T) {
  const originalValue = value;
  value = originalValue === undefined ? defaultValue : originalValue;
  value = originalValue === defaultValue ? undefined : value;

  return value;
}
