import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { type ZodType, z } from "zod";
import type { FunctionAgentFn } from "../agents/agent.js";
import { AIAgentToolChoice } from "../agents/ai-agent.js";
import { ProcessMode, type ReflectionMode } from "../agents/team-agent.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { camelizeSchema, defaultInputSchema, inputOutputSchema, optionalize } from "./schema.js";

export interface HooksSchema {
  onStart?: NestAgentSchema;
  onSuccess?: NestAgentSchema;
  onError?: NestAgentSchema;
  onEnd?: NestAgentSchema;
  onSkillStart?: NestAgentSchema;
  onSkillEnd?: NestAgentSchema;
  onHandoff?: NestAgentSchema;
}

export type NestAgentSchema =
  | string
  | { url: string; defaultInput?: Record<string, any>; hooks?: HooksSchema | HooksSchema[] }
  | AgentSchema;

export interface BaseAgentSchema {
  name?: string;
  description?: string;
  inputSchema?: ZodType<Record<string, any>>;
  defaultInput?: Record<string, any>;
  outputSchema?: ZodType<Record<string, any>>;
  skills?: NestAgentSchema[];
  hooks?: HooksSchema | HooksSchema[];
  memory?:
    | boolean
    | {
        provider: string;
        subscribeTopic?: string[];
      };
}

export interface AIAgentSchema extends BaseAgentSchema {
  type: "ai";
  instructions?: string;
  inputKey?: string;
  outputKey?: string;
  toolChoice?: AIAgentToolChoice;
}

export interface MCPAgentSchema extends BaseAgentSchema {
  type: "mcp";
  url?: string;
  command?: string;
  args?: string[];
}

export interface TeamAgentSchema extends BaseAgentSchema {
  type: "team";
  mode?: ProcessMode;
  iterateOn?: string;
  reflection?: Omit<ReflectionMode, "reviewer"> & { reviewer: NestAgentSchema };
}

export interface TransformAgentSchema extends BaseAgentSchema {
  type: "transform";
  jsonata: string;
}

export interface FunctionAgentSchema extends BaseAgentSchema {
  type: "function";
  process: FunctionAgentFn;
}

export type AgentSchema =
  | AIAgentSchema
  | MCPAgentSchema
  | TeamAgentSchema
  | TransformAgentSchema
  | FunctionAgentSchema;

export async function parseAgentFile(path: string, data: object): Promise<AgentSchema> {
  const agentSchema: ZodType<AgentSchema> = z.lazy(() => {
    const nestAgentSchema: ZodType<NestAgentSchema> = z.lazy(() =>
      z.union([
        agentSchema,
        z.string(),
        camelizeSchema(
          z.object({
            url: z.string(),
            defaultInput: optionalize(defaultInputSchema),
            hooks: optionalize(z.union([hooksSchema, z.array(hooksSchema)])),
          }),
        ),
      ]),
    );

    const hooksSchema: ZodType<HooksSchema> = camelizeSchema(
      z.object({
        onStart: optionalize(nestAgentSchema),
        onSuccess: optionalize(nestAgentSchema),
        onError: optionalize(nestAgentSchema),
        onEnd: optionalize(nestAgentSchema),
        onSkillStart: optionalize(nestAgentSchema),
        onSkillEnd: optionalize(nestAgentSchema),
        onHandoff: optionalize(nestAgentSchema),
      }),
    );

    const baseAgentSchema = z.object({
      name: optionalize(z.string()),
      alias: optionalize(z.array(z.string())),
      description: optionalize(z.string()),
      inputSchema: optionalize(inputOutputSchema({ path })).transform((v) =>
        v ? jsonSchemaToZod(v) : undefined,
      ) as unknown as ZodType<BaseAgentSchema["inputSchema"]>,
      defaultInput: optionalize(defaultInputSchema),
      outputSchema: optionalize(inputOutputSchema({ path })).transform((v) =>
        v ? jsonSchemaToZod(v) : undefined,
      ) as unknown as ZodType<BaseAgentSchema["outputSchema"]>,
      hooks: optionalize(z.union([hooksSchema, z.array(hooksSchema)])),
      skills: optionalize(z.array(nestAgentSchema)),
      memory: optionalize(
        z.union([
          z.boolean(),
          camelizeSchema(
            z.object({
              provider: z.string(),
              subscribeTopic: optionalize(z.array(z.string())),
            }),
          ),
        ]),
      ),
    });

    return camelizeSchema(
      z.discriminatedUnion("type", [
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
                : v &&
                  nodejs.fs.readFile(nodejs.path.join(nodejs.path.dirname(path), v.url), "utf8"),
            ) as ZodType<string | undefined>,
            inputKey: optionalize(z.string()),
            outputKey: optionalize(z.string()),
            toolChoice: optionalize(z.nativeEnum(AIAgentToolChoice)),
          })
          .extend(baseAgentSchema.shape),
        z
          .object({
            type: z.literal("mcp"),
            url: optionalize(z.string()),
            command: optionalize(z.string()),
            args: optionalize(z.array(z.string())),
          })
          .extend(baseAgentSchema.shape),
        z
          .object({
            type: z.literal("team"),
            mode: optionalize(z.nativeEnum(ProcessMode)),
            iterateOn: optionalize(z.string()),
            reflection: camelizeSchema(
              optionalize(
                z.object({
                  reviewer: nestAgentSchema,
                  isApproved: z.string(),
                  maxIterations: optionalize(z.number().int().min(1)),
                  returnLastOnMaxIterations: optionalize(z.boolean()),
                }),
              ),
            ),
          })
          .extend(baseAgentSchema.shape),
        z
          .object({
            type: z.literal("transform"),
            jsonata: z.string(),
          })
          .extend(baseAgentSchema.shape),
        z
          .object({
            type: z.literal("function"),
            process: z.custom<FunctionAgentFn>(),
          })
          .extend(baseAgentSchema.shape),
      ]),
    );
  });

  return agentSchema.parseAsync(data);
}

export async function loadAgentFromYamlFile(path: string) {
  const raw = await tryOrThrow(
    () => nodejs.fs.readFile(path, "utf8"),
    (error) => new Error(`Failed to load agent definition from ${path}: ${error.message}`),
  );

  const json = tryOrThrow(
    () => parse(raw),
    (error) => new Error(`Failed to parse agent definition from ${path}: ${error.message}`),
  );

  const agent = await tryOrThrow(
    async () =>
      await parseAgentFile(path, {
        ...json,
        type: json.type ?? "ai",
        skills: json.skills ?? json.tools,
      }),

    (error) => new Error(`Failed to validate agent definition from ${path}: ${error.message}`),
  );

  return agent;
}
