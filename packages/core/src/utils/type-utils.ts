import { type ZodType, z } from "zod";

export type PromiseOrValue<T> = T | Promise<T>;

export type Nullish<T> = T | null | undefined | void;

export type OmitPropertiesFromArrayFirstElement<
  T extends unknown[],
  K extends string | number | symbol,
> = T extends [infer U, ...infer Rest] ? [Omit<U, K>, ...Rest] : never;

export type XOr<T, K extends keyof T, O extends keyof T> =
  | (Omit<T, O> & { [key in O]?: undefined })
  | (Omit<T, K> & { [key in K]?: undefined });

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

export function isNotEmpty<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0;
}

export function duplicates<T>(arr: T[], key: (item: T) => unknown = (item: T) => item): T[] {
  const seen = new Set();
  const duplicates = new Set<T>();
  for (const item of arr) {
    const k = key(item);
    if (seen.has(k)) {
      duplicates.add(item);
    } else {
      seen.add(k);
    }
  }
  return Array.from(duplicates);
}

export function remove<T>(arr: T[], remove: T[] | ((item: T) => boolean)): T[] {
  const removed: T[] = [];

  for (let i = 0; i < arr.length; i++) {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const item = arr[i]!;
    if (
      (Array.isArray(remove) && remove.includes(item)) ||
      (typeof remove === "function" && remove(item))
    ) {
      removed.push(...arr.splice(i, 1));
      i--;
    }
  }

  return removed;
}

export function unique<T>(arr: T[], key: (item: T) => unknown = (item: T) => item): T[] {
  const seen = new Set();

  return arr.filter((item) => {
    const k = key(item);
    if (seen.has(k)) {
      return false;
    }

    seen.add(k);
    return true;
  });
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...keys: (K | K[])[]
): Omit<T, K> {
  const flattenedKeys = new Set(keys.flat());
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !flattenedKeys.has(key as K)),
  ) as Omit<T, K>;
}

export function omitDeep<T, K>(obj: T, ...keys: (K | K[])[]): unknown {
  if (Array.isArray(obj)) {
    return obj.map((item) => omitDeep(item, ...keys));
  }
  if (isRecord(obj)) {
    const flattenedKeys = new Set(keys.flat());
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([key]) => !flattenedKeys.has(key as K))
        .map(([key, value]) => [key, omitDeep(value, ...keys)]),
    );
  }
  return obj;
}

export function omitBy<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  predicate: (value: T[K], key: K) => boolean,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      const k = key as K;
      return !predicate(value as T[K], k);
    }),
  ) as Partial<T>;
}

export function orArrayToArray<T>(value?: T | T[]): T[] {
  if (isNil(value)) return [];
  return Array.isArray(value) ? value : [value];
}

export function createAccessorArray<T>(
  array: T[],
  accessor: (array: T[], name: string) => T | undefined,
): T[] & { [key: string]: T } {
  return new Proxy(array, {
    get: (t, p, r) => Reflect.get(t, p, r) ?? accessor(array, p as string),
  }) as T[] & { [key: string]: T };
}

export function checkArguments<T extends ZodType>(
  prefix: string,
  schema: T,
  args: unknown,
): z.infer<T> {
  try {
    return schema.parse(args, {
      errorMap: (issue, ctx) => {
        if (issue.code === "invalid_union") {
          // handle all issues that are not invalid_type
          const otherQuestions = issue.unionErrors
            .map(({ issues: [issue] }) => {
              if (issue && issue.code !== "invalid_type") {
                return issue.message || z.defaultErrorMap(issue, ctx).message;
              }
            })
            .filter(isNonNullable);
          if (otherQuestions.length) {
            return { message: otherQuestions.join(", ") };
          }

          // handle invalid_type issues
          const expected = issue.unionErrors
            .map(({ issues: [issue] }) => {
              if (issue?.code === "invalid_type") {
                return issue;
              }
            })
            .filter(isNonNullable);
          if (expected.length) {
            return {
              message: `Expected ${expected.map((i) => i.expected).join(" or ")}, received ${expected[0]?.received}`,
            };
          }
        }

        return { message: ctx.defaultError };
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((i) => `${i.path}: ${i.message}`).join(", ");
      throw new Error(`${prefix} check arguments error: ${message}`);
    }
    throw error;
  }
}

export function tryOrThrow<P extends PromiseOrValue<unknown>>(
  fn: () => P,
  error: string | Error | ((error: Error) => Error),
): P;
export function tryOrThrow<P extends PromiseOrValue<unknown>>(
  fn: () => P,
  error?: Nullish<string | Error | ((error: Error) => Nullish<Error>)>,
): P | undefined;
export function tryOrThrow<P extends PromiseOrValue<unknown>>(
  fn: () => P,
  error?: Nullish<string | Error | ((error: Error) => Nullish<Error>)>,
): P | undefined {
  const createError = (e: Error) => {
    return typeof error === "function"
      ? error(e)
      : typeof error === "string"
        ? new Error(error)
        : error;
  };

  try {
    const result = fn();

    if (result instanceof Promise) {
      return result.catch((e) => {
        const error = createError(e);
        if (error) throw error;
      }) as P;
    }

    return result;
  } catch (e) {
    const error = createError(e);
    if (error) throw error;
  }
}
