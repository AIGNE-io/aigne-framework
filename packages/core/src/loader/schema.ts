import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import camelize from "camelize-ts";
import { parse } from "yaml";
import { type ZodType, z } from "zod";
import { DEFAULT_INPUT_ACTION_GET } from "../agents/agent.js";
import { isRecord } from "../utils/type-utils.js";

export const inputOutputSchema = ({ path }: { path: string }) => {
  const includeExternalSchema = async (schema: any): Promise<typeof schema> => {
    if (schema?.type === "object" && schema.properties) {
      return {
        ...schema,
        properties: Object.fromEntries(
          await Promise.all(
            Object.entries(schema.properties).map(async ([key, value]) => [
              key,
              await includeExternalSchema(value),
            ]),
          ),
        ),
      };
    }

    if (schema?.type === "array" && schema.items) {
      return { ...schema, items: await includeExternalSchema(schema.items) };
    }

    // Load nested schemas from file
    if (typeof schema === "string") {
      const raw = await nodejs.fs.readFile(
        nodejs.path.join(nodejs.path.dirname(path), schema),
        "utf8",
      );
      return nestedJsonSchema.parseAsync(parse(raw));
    }
    return schema;
  };

  const nestedJsonSchema = z
    .object({
      type: z.string(),
    })
    .passthrough()
    .transform((v) => includeExternalSchema(v));

  const jsonSchemaSchema = z
    .object({
      type: z.literal("object"),
      properties: z.record(z.any()),
      required: z.array(z.string()).optional(),
      additionalProperties: z.boolean().optional(),
    })
    .transform((v) => includeExternalSchema(v));

  return z.union([
    z
      .string()
      .transform((v) =>
        nodejs.fs
          .readFile(nodejs.path.join(nodejs.path.dirname(path), v), "utf8")
          .then((raw) => jsonSchemaSchema.parseAsync(parse(raw))),
      ) as unknown as ZodType<z.infer<typeof jsonSchemaSchema>>,
    jsonSchemaSchema,
  ]);
};

export const defaultInputSchema = z.record(
  z.string(),
  z.union([
    z.object({
      [DEFAULT_INPUT_ACTION_GET]: z.string(),
    }),
    z.unknown(),
  ]),
);

export function optionalize<T>(schema: ZodType<T>): ZodType<T | undefined> {
  return schema.nullish().transform((v) => v ?? undefined) as ZodType<T | undefined>;
}

export function camelizeSchema<T extends ZodType>(
  schema: T,
  { shallow = true }: { shallow?: boolean } = {},
): T {
  return z.preprocess((v) => (isRecord(v) ? camelize(v, shallow) : v), schema) as unknown as T;
}
