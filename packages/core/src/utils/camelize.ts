import { camelCase, isArray, isPlainObject, mapKeys, mapValues } from "lodash";

export function camelize<T>(obj: T, shallow: boolean = false): any {
  if (isArray(obj)) {
    return shallow ? obj : obj.map((item) => camelize(item, false));
  }

  if (isPlainObject(obj)) {
    const camelized = mapKeys(obj as Record<string, unknown>, (_value, key) => camelCase(key));
    if (shallow) {
      return camelized;
    } else {
      return mapValues(camelized, (value) => camelize(value as T, false));
    }
  }

  return obj;
}
