import isNil from "lodash/isNil";

/**
 * Retrieves the default value for a given key or keys from a list of objects.
 *
 * @template T - The type of the objects in the list.
 * @template K - The type of the key or keys to retrieve the default value for.
 *
 * @param {K | K[]} key - The key or array of keys to retrieve the default value for.
 * @param {...(T | null | undefined)[]} args - The list of objects to search for the key or keys.
 * @returns {T[K] | { [key in K]: T[key] | undefined } | undefined} - The default value for the given key or keys, or undefined if not found.
 *
 * @example
 * // Single key example
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { a: 3 };
 * const defaultValue = getDefaultValue('a', obj1, obj2); // 1
 *
 * @example
 * // Multiple keys example
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { a: 3, b: 4 };
 * const defaultValues = getDefaultValue(['a', 'b'], obj1, obj2); // { a: 1, b: 2 }
 */
export function getDefaultValue<
  T extends { [key: string]: any },
  K extends keyof T,
>(key: K, ...args: (T | null | undefined)[]): T[K] | undefined;
export function getDefaultValue<
  T extends { [key: string]: any },
  K extends keyof T,
>(
  key: K[],
  ...args: (T | null | undefined)[]
): { [key in K]: T[key] | undefined };
export function getDefaultValue<
  T extends { [key: string]: any },
  K extends keyof T,
>(
  key: K | K[],
  ...args: (T | null | undefined)[]
): T[K] | { [key in K]: T[key] | undefined } | undefined {
  if (Array.isArray(key)) {
    const entries: [K, T[K] | undefined][] = key.map((k) => [
      k,
      getDefaultValue(k, ...args),
    ]);
    return Object.fromEntries(entries) as any;
  }

  for (const i of args) {
    if (!isNil(i?.[key])) return i[key];
  }

  return undefined;
}
