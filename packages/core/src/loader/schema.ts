import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { type ZodType, z } from "zod";

export const inputOutputSchema = ({ path }: { path: string }) => {
  const jsonSchemaSchema = z
    .object({
      type: z.literal("object"),
      properties: z.record(z.any()),
      required: z.array(z.string()).optional(),
      additionalProperties: z.boolean().optional(),
    })
    .transform((v) => {
      const t = async (schema: any): Promise<typeof schema> => {
        if (schema?.type === "object" && schema.properties) {
          return {
            ...schema,
            properties: Object.fromEntries(
              await Promise.all(
                Object.entries(schema.properties).map(async ([key, value]) => [
                  key,
                  await t(value),
                ]),
              ),
            ),
          };
        }

        if (schema?.type === "array" && schema.items) {
          return { ...schema, items: await t(schema.items) };
        }

        // Load nested schemas from file
        if (typeof schema === "string") {
          const raw = await nodejs.fs.readFile(
            nodejs.path.join(nodejs.path.dirname(path), schema),
            "utf8",
          );
          return jsonSchemaSchema.parseAsync(parse(raw));
        }
        return schema;
      };

      return t(v);
    });

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

export function optionalize<T>(schema: ZodType<T>): ZodType<T | undefined> {
  return schema.nullish().transform((v) => v ?? undefined) as ZodType<T | undefined>;
}
