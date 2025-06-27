import { type ZodType, z } from "zod";

export const inputOutputSchema = z.object({
  type: z.literal("object"),
  properties: z.record(z.any()),
  required: z.array(z.string()).optional(),
  additionalProperties: z.boolean().optional(),
});

export function optionalize<T>(schema: ZodType<T>): ZodType<T | undefined> {
  return schema.nullish().transform((v) => v ?? undefined) as ZodType<T | undefined>;
}
