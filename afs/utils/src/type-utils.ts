export type PromiseOrValue<T> = T | Promise<T>;

export type Nullish<T> = T | null | undefined | void;

export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

export function isRecord<T>(value: unknown): value is Record<string, T> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function isEmpty(obj: unknown): boolean {
  if (isNil(obj)) return true;
  if (typeof obj === "string" || Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
}

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return !isNil(value);
}

export function get(obj: any, path: (string | number | symbol)[]): any {
  return path.reduce((acc, key) => (isRecord(acc) ? Reflect.get(acc, key) : undefined), obj);
}
