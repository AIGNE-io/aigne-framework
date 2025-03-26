import { get as _get, isNil } from "lodash-es";
import { type ZodType, z } from "zod";

export type PromiseOrValue<T> = T | Promise<T>;

export type Nullish<T> = T | null | undefined;

export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return !isNil(value);
}

export function isNotEmpty<T>(arr: T[]): arr is [T, ...T[]] {
  return arr.length > 0;
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

export function createAccessorArray<T>(
  array: T[],
  accessor: (array: T[], name: string) => T | undefined,
): T[] & { [key: string]: T } {
  return new Proxy(array, {
    get: (t, p, r) => Reflect.get(t, p, r) ?? accessor(array, p as string),
  }) as T[] & { [key: string]: T };
}

export function checkArguments<T>(prefix: string, schema: ZodType<T>, args: T) {
  try {
    schema.parse(args, {
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
