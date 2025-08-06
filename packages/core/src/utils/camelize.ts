import { isRecord } from "./type-utils.js";

export function camelize<T>(obj: T, shallow: boolean = false): any {
  if (Array.isArray(obj)) {
    return shallow ? obj : obj.map((item) => camelize(item, false));
  }

  if (isRecord(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        camelCase(key),
        shallow ? value : camelize(value, false),
      ]),
    );
  }

  return obj;
}

function camelCase(key: string): string {
  key = key.replace(/[-_#@$\s]+(.)?/g, (g) => g[1]?.toUpperCase() || "");
  key = key.charAt(0).toLowerCase() + key.slice(1);
  return key;
}
