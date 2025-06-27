import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import camelize from "camelize-ts";
import { parse } from "yaml";
import { type ZodType, z } from "zod";
import { AIAgentToolChoice } from "../agents/ai-agent.js";
import { ProcessMode } from "../agents/team-agent.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { inputOutputSchema, optionalize } from "./schema.js";

interface BaseAgentSchema {
  name: string;
  description?: string;
  inputSchema?: ZodType<Record<string, ZodType>>;
  outputSchema?: ZodType<Record<string, ZodType>>;
  skills?: (string | AgentSchema)[];
  memory?:
    | boolean
    | {
        provider: string;
        subscribeTopic?: string[];
      };
}

interface AIAgentSchema extends BaseAgentSchema {
  type: "ai";
  instructions?: string;
  inputKey?: string;
  outputKey?: string;
  toolChoice?: AIAgentToolChoice;
}

interface MCPAgentSchema {
  type: "mcp";
  url?: string;
  command?: string;
  args?: string[];
}

interface TeamAgentSchema extends BaseAgentSchema {
  type: "team";
  mode?: ProcessMode;
  iterateOn?: string;
}

interface TransformAgentSchema extends BaseAgentSchema {
  type: "transform";
  jsonata: string;
}

type AgentSchema = AIAgentSchema | MCPAgentSchema | TeamAgentSchema | TransformAgentSchema;

export async function loadAgentFromYamlFile(path: string) {
  const agentSchema: ZodType<AgentSchema> = z.lazy(() => {
    const baseAgentSchema = z.object({
      name: z.string(),
      description: optionalize(z.string()),
      inputSchema: optionalize(inputOutputSchema).transform<BaseAgentSchema["inputSchema"]>((v) =>
        v ? jsonSchemaToZod(v) : undefined,
      ) as unknown as ZodType<BaseAgentSchema["inputSchema"]>,
      outputSchema: optionalize(inputOutputSchema).transform((v) =>
        v ? jsonSchemaToZod(v) : undefined,
      ) as unknown as ZodType<BaseAgentSchema["outputSchema"]>,
      skills: optionalize(z.array(z.union([z.string(), z.lazy(() => agentSchema)]))),
      memory: optionalize(
        z.union([
          z.boolean(),
          z.object({
            provider: z.string(),
            subscribeTopic: optionalize(z.array(z.string())),
          }),
        ]),
      ),
    });

    return z.discriminatedUnion("type", [
      z
        .object({
          type: z.literal("ai"),
          instructions: optionalize(
            z.union([
              z.string(),
              z.object({
                url: z.string(),
              }),
            ]),
          ).transform((v) =>
            typeof v === "string"
              ? v
              : v && nodejs.fs.readFile(nodejs.path.join(nodejs.path.dirname(path), v.url), "utf8"),
          ) as ZodType<string | undefined>,
          inputKey: optionalize(z.string()),
          outputKey: optionalize(z.string()),
          toolChoice: optionalize(z.nativeEnum(AIAgentToolChoice)),
        })
        .extend(baseAgentSchema.shape),
      z.object({
        type: z.literal("mcp"),
        url: optionalize(z.string()),
        command: optionalize(z.string()),
        args: optionalize(z.array(z.string())),
      }),
      z
        .object({
          type: z.literal("team"),
          mode: optionalize(z.nativeEnum(ProcessMode)),
          iterateOn: optionalize(z.string()),
        })
        .extend(baseAgentSchema.shape),
      z
        .object({
          type: z.literal("transform"),
          jsonata: z.string(),
        })
        .extend(baseAgentSchema.shape),
    ]);
  });

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
      await agentSchema.parseAsync(
        camelize({
          ...json,
          type: json.type ?? "ai",
          skills: json.skills ?? json.tools,
        }),
      ),

    (error) => new Error(`Failed to validate agent definition from ${path}: ${error.message}`),
  );

  return agent;
}
