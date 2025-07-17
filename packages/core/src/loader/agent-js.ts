import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { type ZodObject, type ZodType, z } from "zod";
import { Agent, type FunctionAgentFn } from "../agents/agent.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { camelizeSchema, inputOutputSchema, optionalize } from "./schema.js";

export async function loadAgentFromJsFile(path: string) {
  const agentJsFileSchema = camelizeSchema(
    z.object({
      name: z.string(),
      description: optionalize(z.string()),
      inputSchema: optionalize(inputOutputSchema({ path })).transform((v) =>
        v ? jsonSchemaToZod<ZodObject<Record<string, ZodType>>>(v) : undefined,
      ),
      outputSchema: optionalize(inputOutputSchema({ path })).transform((v) =>
        v ? jsonSchemaToZod<ZodObject<Record<string, ZodType>>>(v) : undefined,
      ),
      process: z.custom<FunctionAgentFn>(),
    }),
  );

  const { default: agent } = await tryOrThrow(
    () => import(/* @vite-ignore */ path),
    (error) => new Error(`Failed to load agent definition from ${path}: ${error.message}`),
  );

  if (agent instanceof Agent) return agent;

  if (typeof agent !== "function") {
    throw new Error(`Agent file ${path} must export a default function, but got ${typeof agent}`);
  }

  return tryOrThrow(
    () =>
      agentJsFileSchema.parseAsync({
        ...agent,
        name: agent.agent_name || agent.agentName || agent.name,
        process: agent,
      }),
    (error) => new Error(`Failed to parse agent from ${path}: ${error.message}`),
  );
}
