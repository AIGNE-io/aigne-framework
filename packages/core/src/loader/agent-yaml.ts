import type { AFSOptions } from "@aigne/afs";
import { jsonSchemaToZod } from "@aigne/json-schema-to-zod";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { parse } from "yaml";
import { type ZodType, z } from "zod";
import type { Agent, AgentHooks, TaskRenderMode } from "../agents/agent.js";
import { tryOrThrow } from "../utils/type-utils.js";
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

export type AFSDriverSchema =
  | string
  | {
      driver: string;
      options?: Record<string, any>;
    };

export interface AFSContextPresetSchema {
  view?: string;
  select?: {
    agent: NestAgentSchema;
  };
  per?: {
    agent: NestAgentSchema;
  };
  dedupe?: {
    agent: NestAgentSchema;
  };
}

export interface AFSContextSchema {
  search?: {
    presets?: Record<string, AFSContextPresetSchema>;
  };
  list?: {
    presets?: Record<string, AFSContextPresetSchema>;
  };
}

export interface AgentSchema {
  type: string;
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
    | (Omit<AFSOptions, "modules" | "drivers" | "context"> & {
        modules?: AFSModuleSchema[];
        drivers?: AFSDriverSchema[];
        context?: AFSContextSchema;
      });
  shareAFS?: boolean;
  historyConfig?: Agent["historyConfig"];
  [key: string]: unknown;
}

export async function parseAgentFile(
  path: string,
  data: any,
  options: LoadOptions,
): Promise<AgentSchema> {
  const agentSchema = getAgentSchema({ filepath: path, options });

  return agentSchema.parseAsync({
    ...data,
    model: data.model || data.chatModel || data.chat_model,
  });
}

export async function loadAgentFromYamlFile(path: string, options: LoadOptions) {
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
      await parseAgentFile(
        path,
        {
          ...json,
          type: json.type ?? "ai",
          skills: json.skills ?? json.tools,
        },
        options,
      ),

    (error) => new Error(`Failed to validate agent definition from ${path}: ${error.message}`),
  );

  return agent;
}

export const getAgentSchema = ({ filepath }: { filepath: string; options?: LoadOptions }) => {
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

    const afsContextPresetsSchema = z.object({
      presets: optionalize(
        z.record(
          z.string(),
          z.object({
            view: optionalize(z.string()),
            select: optionalize(
              z.object({
                agent: nestAgentSchema,
              }),
            ),
            per: optionalize(
              z.object({
                agent: nestAgentSchema,
              }),
            ),
            dedupe: optionalize(
              z.object({
                agent: nestAgentSchema,
              }),
            ),
          }),
        ),
      ),
    });

    const baseAgentSchema = z.object({
      type: z.string(),
      name: optionalize(z.string()),
      alias: optionalize(z.array(z.string())),
      description: optionalize(z.string()),
      model: optionalize(chatModelSchema),
      imageModel: optionalize(imageModelSchema),
      taskTitle: optionalize(z.string()),
      taskRenderMode: optionalize(z.union([z.literal("hide"), z.literal("collapse")])),
      inputSchema: optionalize(inputOutputSchema({ path: filepath })).transform((v) =>
        v ? jsonSchemaToZod(v) : undefined,
      ) as unknown as ZodType<AgentSchema["inputSchema"]>,
      defaultInput: optionalize(defaultInputSchema),
      outputSchema: optionalize(inputOutputSchema({ path: filepath })).transform((v) =>
        v ? jsonSchemaToZod(v) : undefined,
      ) as unknown as ZodType<AgentSchema["outputSchema"]>,
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
              drivers: optionalize(
                z.array(
                  z.union([
                    z.string(),
                    camelizeSchema(
                      z.object({
                        driver: z.string(),
                        options: optionalize(z.record(z.any())),
                      }),
                    ),
                  ]),
                ),
              ),
              storage: optionalize(
                camelizeSchema(
                  z.object({
                    url: z.string(),
                  }),
                ),
              ),
              context: optionalize(
                z.object({
                  search: optionalize(afsContextPresetsSchema),
                  list: optionalize(afsContextPresetsSchema),
                }),
              ),
            }),
          ),
        ]),
      ),
      shareAFS: optionalize(z.boolean()),
      historyConfig: camelizeSchema(
        optionalize(
          z.object({
            enabled: optionalize(z.boolean()),
            record: optionalize(z.boolean()),
            inject: optionalize(z.boolean()),
            use_old_memory: optionalize(z.boolean()),
            maxTokens: optionalize(z.number().int().positive()),
            maxItems: optionalize(z.number().int().positive()),
          }),
        ),
      ),
    });

    return camelizeSchema(baseAgentSchema.passthrough());
  });

  return agentSchema;
};

export const getNestAgentSchema = ({
  filepath,
}: {
  filepath: string;
}): ZodType<NestAgentSchema> => {
  const agentSchema = getAgentSchema({ filepath });

  return z.lazy(() =>
    z.union([
      agentSchema,
      z.string(),
      camelizeSchema(
        z.object({
          url: z.string(),
          defaultInput: optionalize(defaultInputSchema),
        }),
      ),
    ]),
  );
};
