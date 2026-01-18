import { type ZodEffects, type ZodType, z } from "zod";
import { fromZodError } from "zod-validation-error";
import { isRecord } from "../type-utils.js";
import { camelize as camelizeObject } from "./camelize.js";

export function optionalize<T>(schema: ZodType<T>): ZodType<T | undefined> {
  return schema.nullish().transform((v) => v ?? undefined) as ZodType<T | undefined>;
}

export function camelize<T extends ZodType>(
  schema: T,
  { shallow = true }: { shallow?: boolean } = {},
): ZodEffects<T, T["_output"], any> {
  return z.preprocess((v) => (isRecord(v) ? camelizeObject(v, shallow) : v), schema);
}

export interface ZodParseOptions {
  prefix?: string;
  prefixSeparator?: string;
  async?: boolean;
}

export function zodParse<T extends ZodType>(
  schema: T,
  data: unknown,
  options?: Omit<ZodParseOptions, "async"> | (ZodParseOptions & { async?: false }),
): z.infer<T>;

export function zodParse<T extends ZodType>(
  schema: T,
  data: unknown,
  options: ZodParseOptions & { async: true },
): Promise<z.infer<T>>;

export function zodParse<T extends ZodType>(
  schema: T,
  data: unknown,
  options?: ZodParseOptions,
): z.infer<T> | Promise<z.infer<T>> {
  if (options?.async) {
    return schema.parseAsync(data).catch((error) => {
      if (error instanceof z.ZodError) {
        throw fromZodError(error, {
          prefix: options?.prefix,
          prefixSeparator: options?.prefixSeparator ?? ": ",
        });
      }
      throw error;
    });
  }

  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw fromZodError(error, {
        prefix: options?.prefix,
        prefixSeparator: options?.prefixSeparator ?? ": ",
      });
    }
    throw error;
  }
}
