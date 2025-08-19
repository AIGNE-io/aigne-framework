export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${P1}${Uppercase<P2>}${CamelCase<P3>}`
  : S;

export type CamelizeObject<T, S = false> = {
  [K in keyof T as Uncapitalize<CamelCase<string & K>>]: T[K] extends Date
    ? T[K]
    : T[K] extends RegExp
      ? T[K]
      : T[K] extends Array<infer U>
        ? U extends object | undefined
          ? Array<CamelizeObject<U>>
          : T[K]
        : T[K] extends object | undefined
          ? S extends true
            ? T[K]
            : CamelizeObject<T[K]>
          : T[K];
};

export type Camelize<T, S = false> = T extends Array<infer U>
  ? Array<CamelizeObject<U, S>>
  : CamelizeObject<T, S>;

export function camelize<T, S extends boolean = false>(
  obj: T,
  shallow?: S,
): T extends string ? string : Camelize<T, S> {
  return typeof obj === "string" ? (camelCase(obj) as any) : walk(obj, shallow, camelCase);
}

export function snakelize<T, S extends boolean = false>(
  obj: T,
  shallow?: S,
): T extends string ? string : any {
  return typeof obj === "string" ? (snakeCase(obj) as any) : walk(obj, shallow, snakeCase);
}

function camelCase(key: string): string {
  key = key.replace(/[_.-](\w|$)/g, (_, char) => char.toUpperCase());
  key = key.charAt(0).toLowerCase() + key.slice(1);
  return key;
}

function snakeCase(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
}

function walk(obj: any, shallow = false, transform: (key: string) => string): any {
  if (!obj || typeof obj !== "object") return obj;
  if (obj instanceof Date || obj instanceof RegExp) return obj;

  if (Array.isArray(obj))
    return obj.map((v) => {
      if (!shallow) {
        return walk(v, shallow, transform);
      }
      if (typeof v === "object") return walk(v, shallow, transform);
      return v;
    });

  return Object.keys(obj).reduce(
    (res, key) => {
      const newKey = transform(key);
      res[newKey] = shallow ? obj[key] : walk(obj[key], shallow, transform);
      return res;
    },
    {} as Record<string, any>,
  );
}
