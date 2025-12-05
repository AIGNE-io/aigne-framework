import type { AFSOptions } from "@aigne/afs";
import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { type ZodType, z } from "zod";
import type { Agent, AgentHooks, FunctionAgentFn, TaskRenderMode } from "../agents/agent.js";
import { AIAgentToolChoice } from "../agents/ai-agent.js";
import { type Role, roleSchema } from "../agents/chat-model.js";
import { ProcessMode, type ReflectionMode } from "../agents/team-agent.js";
import { tryOrThrow } from "../utils/type-utils.js";
import { codeToFunctionAgentFn } from "./function-agent.js";
import type { LoadOptions } from "./index.js";
import {
  camelizeSchema,
  chatModelSchema,
  defaultInputSchema,
  imageModelSchema,
  inputOutputSchema,
  optionalize,
} from "./schema.js";

export interface HooksSchema {
  priority?: AgentHooks["priority"];
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

export type AFSModuleSchema =
  | string
  | {
      module: string;
      options?: Record<string, any>;
    };

export interface BaseAgentSchema {
  name?: string;
  description?: string;
  model?: z.infer<typeof chatModelSchema>;
  imageModel?: z.infer<typeof imageModelSchema>;
  taskTitle?: string;
  taskRenderMode?: TaskRenderMode;
  inputSchema?: ZodType<Record<string, any>>;
  defaultInput?: Record<string, any>;
  outputSchema?: ZodType<Record<string, any>>;
  includeInputInOutput?: boolean;
  skills?: NestAgentSchema[];
  hooks?: HooksSchema | HooksSchema[];
  memory?:
    | boolean
    | {
        provider: string;
        subscribeTopic?: string[];
      };
  afs?:
    | boolean
    | (Omit<AFSOptions, "modules"> & {
        modules?: AFSModuleSchema[];
      });
  shareAFS?: boolean;
}

export type Instructions = { role: Exclude<Role, "tool">; content: string; path: string }[];

export interface AIAgentSchema extends BaseAgentSchema {
  type: "ai";
  instructions?: Instructions;
  autoReorderSystemMessages?: boolean;
  autoMergeSystemMessages?: boolean;
  inputKey?: string;
  inputFileKey?: string;
  outputKey?: string;
  outputFileKey?: string;
  toolChoice?: AIAgentToolChoice;
  toolCallsConcurrency?: number;
  keepTextInToolUses?: boolean;
}

export interface ImageAgentSchema extends BaseAgentSchema {
  type: "image";
  instructions: Instructions;
  inputFileKey?: string;
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
  concurrency?: number;
  iterateWithPreviousOutput?: boolean;
  includeAllStepsOutput?: boolean;
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

export interface ThirdAgentSchema extends BaseAgentSchema {
  agentClass?: new (...args: any[]) => Agent<any, any>;
  type: string;
  instructions?: Instructions;
  [key: string]: any;
}

export type AgentSchema =
  | AIAgentSchema
  | ImageAgentSchema
  | MCPAgentSchema
  | TeamAgentSchema
  | TransformAgentSchema
  | FunctionAgentSchema
  | ThirdAgentSchema;

export async function parseAgentFile(path: string, data: any): Promise<AgentSchema> {
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
        priority: optionalize(z.union([z.literal("low"), z.literal("medium"), z.literal("high")])),
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
      model: optionalize(chatModelSchema),
      imageModel: optionalize(imageModelSchema),
      taskTitle: optionalize(z.string()),
      taskRenderMode: optionalize(z.union([z.literal("hide"), z.literal("collapse")])),
      inputSchema: optionalize(inputOutputSchema({ path })).transform((v) =>
        v ? jsonSchemaToZod(v) : undefined,
      ) as unknown as ZodType<BaseAgentSchema["inputSchema"]>,
      defaultInput: optionalize(defaultInputSchema),
      outputSchema: optionalize(inputOutputSchema({ path })).transform((v) =>
        v ? jsonSchemaToZod(v) : undefined,
      ) as unknown as ZodType<BaseAgentSchema["outputSchema"]>,
      includeInputInOutput: optionalize(z.boolean()),
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
      afs: optionalize(
        z.union([
          z.boolean(),
          camelizeSchema(
            z.object({
              modules: optionalize(
                z.array(
                  z.union([
                    z.string(),
                    camelizeSchema(
                      z.object({
                        module: z.string(),
                        options: optionalize(z.record(z.any())),
                      }),
                    ),
                  ]),
                ),
              ),
            }),
          ),
        ]),
      ),
      shareAFS: optionalize(z.boolean()),
    });

    const instructionItemSchema = z.union([
      z.object({
        role: roleSchema.default("system"),
        url: z.string(),
      }),
      z.object({
        role: roleSchema.default("system"),
        content: z.string(),
      }),
    ]);

    const parseInstructionItem = async ({
      role,
      ...v
    }: z.infer<typeof instructionItemSchema>): Promise<Instructions[number]> => {
      if (role === "tool")
        throw new Error(`'tool' role is not allowed in instruction item in agent file ${path}`);

      if ("content" in v && typeof v.content === "string") {
        return { role, content: v.content, path };
      }
      if ("url" in v && typeof v.url === "string") {
        const url = nodejs.path.isAbsolute(v.url)
          ? v.url
          : nodejs.path.join(nodejs.path.dirname(path), v.url);
        return nodejs.fs.readFile(url, "utf8").then((content) => ({ role, content, path: url }));
      }
      throw new Error(
        `Invalid instruction item in agent file ${path}. Expected 'content' or 'url' property`,
      );
    };

    const instructionsSchema = z
      .union([z.string(), instructionItemSchema, z.array(instructionItemSchema)])
      .transform(async (v): Promise<Instructions> => {
        if (typeof v === "string") return [{ role: "system", content: v, path }];

        if (Array.isArray(v)) {
          return Promise.all(v.map((item) => parseInstructionItem(item)));
        }

        return [await parseInstructionItem(v)];
      }) as unknown as ZodType<Instructions>;

    return camelizeSchema(
      z.union([
        z
          .object({
            type: z.string(),
            agentClass: z.custom<new () => Agent>(
              (v) => typeof v?.prototype?.constructor === "function",
            ),
            instructions: optionalize(instructionsSchema),
          })
          .extend(baseAgentSchema.shape),
        z.discriminatedUnion("type", [
          z
            .object({
              type: z.literal("ai"),
              instructions: optionalize(instructionsSchema),
              autoReorderSystemMessages: optionalize(z.boolean()),
              autoMergeSystemMessages: optionalize(z.boolean()),
              inputKey: optionalize(z.string()),
              outputKey: optionalize(z.string()),
              inputFileKey: optionalize(z.string()),
              outputFileKey: optionalize(z.string()),
              toolChoice: optionalize(z.nativeEnum(AIAgentToolChoice)),
              toolCallsConcurrency: optionalize(z.number().int().min(0)),
              keepTextInToolUses: optionalize(z.boolean()),
              catchToolsError: optionalize(z.boolean()),
              structuredStreamMode: optionalize(z.boolean()),
            })
            .extend(baseAgentSchema.shape),
          z
            .object({
              type: z.literal("image"),
              instructions: instructionsSchema,
              inputFileKey: optionalize(z.string()),
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
              concurrency: optionalize(z.number().int().min(1)),
              iterateWithPreviousOutput: optionalize(z.boolean()),
              includeAllStepsOutput: optionalize(z.boolean()),
              reflection: camelizeSchema(
                optionalize(
                  z.object({
                    reviewer: nestAgentSchema,
                    isApproved: z.string(),
                    maxIterations: optionalize(z.number().int().min(1)),
                    returnLastOnMaxIterations: optionalize(z.boolean()),
                    customErrorMessage: optionalize(z.string()),
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
              process: z.preprocess(
                (v) => (typeof v === "string" ? codeToFunctionAgentFn(v) : v),
                z.custom<FunctionAgentFn>(),
              ) as ZodType<FunctionAgentFn>,
            })
            .extend(baseAgentSchema.shape),
        ]),
      ]),
    );
  });

  return agentSchema.parseAsync({
    ...data,
    model: data.model || data.chatModel || data.chat_model,
  });
}

export async function loadAgentFromYamlFile(path: string, options?: LoadOptions) {
  const raw = await tryOrThrow(
    () => nodejs.fs.readFile(path, "utf8"),
    (error) => new Error(`Failed to load agent definition from ${path}: ${error.message}`),
  );

  const json = tryOrThrow(
    () => parse(raw),
    (error) => new Error(`Failed to parse agent definition from ${path}: ${error.message}`),
  );

  if (!["ai", "image", "mcp", "team", "transform", "function"].includes(json?.type)) {
    if (typeof json?.type === "string") {
      if (!options?.require)
        throw new Error(
          `Module loader is not provided to load agent type module ${json.type} from ${path}`,
        );
      const Mod = await options.require(json.type, { parent: path });
      if (typeof Mod?.default?.prototype?.constructor !== "function") {
        throw new Error(`The agent type module ${json.type} does not export a default Agent class`);
      }

      json.agentClass = Mod.default;
    }
  }

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
