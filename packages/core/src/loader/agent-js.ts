import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { type ZodFunction, type ZodObject, type ZodTuple, type ZodType, z } from "zod";
import { Agent, type Message } from "../agents/agent.js";
import { customCamelize } from "../utils/camelize.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { inputOutputSchema } from "./schema.js";

const agentJsFileSchema = z.object({
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
  process: z.function() as unknown as ZodFunction<ZodTuple<[ZodType<Message>]>, ZodType<Message>>,
});

export async function loadAgentFromJsFile(path: string) {
  const { default: agent } = await tryOrThrow(
    () => import(path),
    (error) => new Error(`Failed to load agent definition from ${path}: ${error.message}`),
  );

  if (agent instanceof Agent) return agent;

  if (typeof agent !== "function") {
    throw new Error(`Agent file ${path} must export a default function, but got ${typeof agent}`);
  }

  return tryOrThrow(
    () =>
      customCamelize(
        agentJsFileSchema.parse({
          ...agent,
          name: agent.agent_name || agent.name,
          process: agent,
        }),
        { shallowKeys: ["input_schema", "output_schema"] },
      ),
    (error) => new Error(`Failed to parse agent from ${path}: ${error.message}`),
  );
}
