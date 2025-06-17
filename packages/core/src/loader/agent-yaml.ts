import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { type ZodObject, type ZodType, z } from "zod";
import { AIAgentToolChoice } from "../agents/ai-agent.js";
import { ProcessMode } from "../agents/team-agent.js";
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
      .union([
        z.string(),
        z.object({
          url: z.string(),
        }),
      ])
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
    skills: z
      .array(z.string())
      .nullish()
      .transform((v) => v ?? undefined),
    tool_choice: z
      .nativeEnum(AIAgentToolChoice)
      .nullish()
      .transform((v) => v ?? undefined),
    memory: z
      .union([
        z.boolean(),
        z.object({
          provider: z.string(),
          subscribe_topic: z
            .array(z.string())
            .nullish()
            .transform((v) => v ?? undefined),
        }),
      ])
      .nullish()
      .transform((v) => v || undefined),
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
  z.object({
    type: z.literal("team"),
    name: z.string(),
    description: z
      .string()
      .nullish()
      .transform((v) => v ?? undefined),
    input_schema: inputOutputSchema
      .nullish()
      .transform((v) => (v ? jsonSchemaToZod<ZodObject<Record<string, ZodType>>>(v) : undefined)),
    output_schema: inputOutputSchema
      .nullish()
      .transform((v) => (v ? jsonSchemaToZod<ZodObject<Record<string, ZodType>>>(v) : undefined)),
    skills: z
      .array(z.string())
      .nullish()
      .transform((v) => v ?? undefined),
    mode: z
      .nativeEnum(ProcessMode)
      .nullish()
      .transform((v) => v ?? undefined),
  }),
]);

export async function loadAgentFromYamlFile(path: string) {
  const raw = await tryOrThrow(
    () => nodejs.fs.readFile(path, "utf8"),
    (error) => new Error(`Failed to load agent definition from ${path}: ${error.message}`),
  );

  const json = await tryOrThrow(
    () => parse(raw),
    (error) => new Error(`Failed to parse agent definition from ${path}: ${error.message}`),
  );

  const agent = await tryOrThrow(
    async () =>
      customCamelize(
        await agentFileSchema.parseAsync({
          ...json,
          type: json.type ?? "ai",
          skills: json.skills ?? json.tools,
        }),
        {
          shallowKeys: ["input_schema", "output_schema"],
        },
      ),
    (error) => new Error(`Failed to validate agent definition from ${path}: ${error.message}`),
  );

  if (agent.type === "ai") {
    return {
      ...agent,
      instructions:
        typeof agent.instructions === "object" && "url" in agent.instructions
          ? await nodejs.fs.readFile(
              nodejs.path.join(nodejs.path.dirname(path), agent.instructions.url),
              "utf8",
            )
          : agent.instructions,
    };
  }

  return agent;
}
