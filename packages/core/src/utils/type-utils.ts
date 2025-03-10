import { get as _get } from "lodash";
import isNil from "lodash/isNil";

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return !isNil(value);
}

export function orArrayToArray<T>(value?: T | T[]): T[] {
  if (isNil(value)) return [];
  return Array.isArray(value) ? value : [value];
}

export function get(obj: unknown, path: string | string[], type?: undefined): unknown | undefined;
export function get(obj: unknown, path: string | string[], type: "string"): string | undefined;
export function get(obj: unknown, path: string | string[], type: "number"): number | undefined;
export function get(obj: unknown, path: string | string[], type?: "string" | "number") {
  const v = _get(obj, path);
  if (type === "string" && typeof v === "string") return v;
  if (type === "number" && typeof v === "number") return v;
}
