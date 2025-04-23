import { readFile } from "node:fs/promises";
import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { parse } from "yaml";
import { type ZodObject, type ZodType, z } from "zod";
import { customCamelize } from "../utils/camelize.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { inputOutputSchema } from "./schema.js";

const agentFileSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ai"),
    name: z.string(),
    description: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
    instructions: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
    input_schema: inputOutputSchema
      .nullish()
      .transform((v) => (v ? jsonSchemaToZod<ZodObject<Record<string, ZodType>>>(v) : undefined)),
    output_schema: inputOutputSchema
      .nullish()
      .transform((v) => (v ? jsonSchemaToZod<ZodObject<Record<string, ZodType>>>(v) : undefined)),
    output_key: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
    tools: z
      .array(z.string())
      .nullish()
      .transform((v) => v ?? undefined),
    tool_choice: z
      .union([z.literal("auto"), z.literal("none"), z.literal("required"), z.literal("router")])
      .nullish()
      .transform((v) => v ?? undefined),
    memory: z
      .union([
        z.boolean().transform((v) => v || undefined),
        z.object({
          subscribe_topic: z
            .array(z.string())
            .nullish()
            .transform((v) => v ?? undefined),
        }),
      ])
      .transform((v) => v ?? undefined),
  }),
  z.object({
    type: z.literal("mcp"),
    url: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
    command: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
    args: z
      .array(z.string())
      .nullish()
      .transform((v) => v ?? undefined),
  }),
]);

export async function loadAgentFromYamlFile(path: string) {
  const raw = await tryOrThrow(
    () => readFile(path, "utf8"),
    (error) => new Error(`Failed to load agent definition from ${path}: ${error.message}`),
  );

  const json = await tryOrThrow(
    () => parse(raw),
    (error) => new Error(`Failed to parse agent definition from ${path}: ${error.message}`),
  );

  const agent = tryOrThrow(
    () =>
      customCamelize(agentFileSchema.parse({ ...json, type: json.type ?? "ai" }), {
        shallowKeys: ["input_schema", "output_schema"],
      }),
    (error) => new Error(`Failed to validate agent definition from ${path}: ${error.message}`),
  );

  return agent;
}
