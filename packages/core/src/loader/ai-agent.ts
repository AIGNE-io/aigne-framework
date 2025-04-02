import { readFile } from "node:fs/promises";
import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { parse } from "yaml";
import { type ZodObject, type ZodType, z } from "zod";
import { tryOrThrow } from "../utils/type-utils.js";
import { inputOutputSchema } from "./schema.js";

const agentFileSchema = z.object({
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
});

export async function loadAgentFromYamlFile(
  path: string,
  { readFile: _readFile = readFile }: { readFile?: typeof readFile } = {},
) {
  const raw = await tryOrThrow(
    () => _readFile(path, "utf8"),
    (error) => new Error(`Failed to load agent definition from ${path}: ${error.message}`),
  );

  const json = await tryOrThrow(
    () => parse(raw),
    (error) => new Error(`Failed to parse agent definition from ${path}: ${error.message}`),
  );

  const agent = tryOrThrow(
    () => agentFileSchema.parse(json),
    (error) => new Error(`Failed to validate agent definition from ${path}: ${error.message}`),
  );

  return agent;
}
