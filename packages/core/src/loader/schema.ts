import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { type ZodType, z } from "zod";

const jsonSchemaSchema = z.object({
  type: z.literal("object"),
  properties: z.record(z.any()),
  required: z.array(z.string()).optional(),
  additionalProperties: z.boolean().optional(),
});

export const inputOutputSchema = ({ path }: { path: string }) =>
  z.union([
    z
      .string()
      .transform((v) =>
        nodejs.fs
          .readFile(nodejs.path.join(nodejs.path.dirname(path), v), "utf8")
          .then((raw) => jsonSchemaSchema.parse(parse(raw))),
      ) as unknown as ZodType<z.infer<typeof jsonSchemaSchema>>,
    jsonSchemaSchema,
  ]);

export function optionalize<T>(schema: ZodType<T>): ZodType<T | undefined> {
  return schema.nullish().transform((v) => v ?? undefined) as ZodType<T | undefined>;
}
