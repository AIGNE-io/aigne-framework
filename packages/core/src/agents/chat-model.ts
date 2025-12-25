import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { type ZodType, z } from "zod";
import { convertJsonSchemaToZod, type JSONSchema } from "zod-from-json-schema";
import { optionalize } from "../loader/schema.js";
import { wrapAutoParseJsonSchema } from "../utils/json-schema.js";
import { logger } from "../utils/logger.js";
import { checkArguments, isNil, omitByDeep, type PromiseOrValue } from "../utils/type-utils.js";
import {
  type Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessResult,
  type AgentResponse,
  type AgentResponseStream,
  agentOptionsSchema,
  type GetterSchema,
  getterSchema,
  type Message,
} from "./agent.js";
import {
  type FileType,
  type FileUnionContent,
  fileContentSchema,
  fileUnionContentSchema,
  localContentSchema,
  Model,
  urlContentSchema,
} from "./model.js";

const CHAT_MODEL_DEFAULT_RETRY_OPTIONS: Agent["retryOnError"] = {
  retries: 3,
  shouldRetry: async (error) =>
    error instanceof StructuredOutputError || (await import("is-network-error")).default(error),
};

export class StructuredOutputError extends Error {}

export interface ChatModelOptions
  extends Omit<
    AgentOptions<ChatModelInput, ChatModelOutput>,
    "model" | "inputSchema" | "outputSchema"
  > {
  model?: string;

  modelOptions?: ChatModelInputOptionsWithGetter;
}

/**
 * ChatModel is an abstract base class for interacting with Large Language Models (LLMs).
 *
 * This class extends the Agent class and provides a common interface for handling model inputs,
 * outputs, and capabilities. Specific model implementations (like OpenAI, Anthropic, etc.)
 * should inherit from this class and implement their specific functionalities.
 *
 * @example
 * Here's how to implement a custom ChatModel:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model}
 *
 * @example
 * Here's an example showing streaming response with readable stream:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model-streaming}
 *
 * @example
 * Here's an example showing streaming response with async generator:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model-streaming-async-generator}
 *
 * @example
 * Here's an example with tool calls:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model-tools}
 */
export abstract class ChatModel extends Model<ChatModelInput, ChatModelOutput> {
  override tag = "ChatModelAgent";

  constructor(public override options?: ChatModelOptions) {
    if (options) checkArguments("ChatModel", chatModelOptionsSchema, options);

    const retryOnError =
      options?.retryOnError === false
        ? false
        : options?.retryOnError === true
          ? CHAT_MODEL_DEFAULT_RETRY_OPTIONS
          : {
              ...CHAT_MODEL_DEFAULT_RETRY_OPTIONS,
              ...options?.retryOnError,
            };

    super({
      ...options,
      inputSchema: chatModelInputSchema,
      outputSchema: chatModelOutputSchema,
      retryOnError,
    });
  }

  get credential(): PromiseOrValue<{
    url?: string;
    apiKey?: string;
    model?: string;
  }> {
    return {};
  }

  /**
   * Indicates whether the model supports parallel tool calls
   *
   * Defaults to true, subclasses can override this property based on
   * specific model capabilities
   */
  protected supportsParallelToolCalls = true;

  /**
   * Gets the model's supported capabilities
   *
   * Currently returns capabilities including: whether parallel tool calls are supported
   *
   * @returns An object containing model capabilities
   */
  getModelCapabilities() {
    return {
      supportsParallelToolCalls: this.supportsParallelToolCalls,
    };
  }

  private validateToolNames(tools?: ChatModelInputTool[]) {
    for (const tool of tools ?? []) {
      if (!/^[a-zA-Z0-9_]+$/.test(tool.function.name)) {
        throw new Error(
          `Tool name "${tool.function.name}" can only contain letters, numbers, and underscores`,
        );
      }
    }
  }

  /**
   * Normalizes tool names to ensure compatibility with language models
   *
   * This method converts tool names to a format that complies with model requirements
   * by replacing hyphens and whitespace characters with underscores. The normalized
   * names are used for tool calls while preserving the original names for reference.
   *
   * @param name - The original tool name to normalize
   * @returns A promise that resolves to the normalized tool name
   */
  protected async normalizeToolName(name: string): Promise<string> {
    return name.replaceAll(/[-\s]/g, "_");
  }

  /**
   * Performs preprocessing operations before handling input
   *
   * Primarily checks if token usage exceeds limits, throwing an exception if limits are exceeded
   *
   * @param input Input message
   * @param options Options for invoking the agent
   * @throws Error if token usage exceeds maximum limit
   */
  protected override async preprocess(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): Promise<void> {
    super.preprocess(input, options);
    const { limits, usage } = options.context;
    const usedTokens = usage.outputTokens + usage.inputTokens;
    if (limits?.maxTokens && usedTokens >= limits.maxTokens) {
      throw new Error(`Exceeded max tokens ${usedTokens}/${limits.maxTokens}`);
    }

    // Automatically convert tool names to a valid format
    if (input.tools?.length) {
      const toolsMap: { [name: string]: ChatModelInputTool } = {};
      const tools: ChatModelInputTool[] = [];

      for (const originalTool of input.tools) {
        const name = await this.normalizeToolName(originalTool.function.name);

        const tool: ChatModelInputTool = {
          ...originalTool,
          function: { ...originalTool.function, name },
        };

        tools.push(tool);
        toolsMap[name] = originalTool;
      }

      this.validateToolNames(tools);

      Object.assign(input, { tools });
      Object.defineProperty(input, "_toolsMap", {
        value: toolsMap,
        enumerable: false,
      });
    }

    input.messages = await Promise.all(
      input.messages.map(async (message) => {
        if (!Array.isArray(message.content)) return message;

        return {
          ...message,
          content: await Promise.all(
            message.content.map(async (item) => {
              if (item.type === "local") {
                return {
                  ...item,
                  type: "file" as const,
                  data: await nodejs.fs.readFile(item.path, "base64"),
                  path: undefined,
                  mimeType:
                    item.mimeType || (await ChatModel.getMimeType(item.filename || item.path)),
                };
              }

              if (
                (input.modelOptions?.preferInputFileType ||
                  this.options?.modelOptions?.preferInputFileType) !== "url"
              ) {
                if (item.type === "url") {
                  return {
                    ...item,
                    type: "file" as const,
                    data: Buffer.from(
                      await (await this.downloadFile(item.url)).arrayBuffer(),
                    ).toString("base64"),
                    url: undefined,
                    mimeType:
                      item.mimeType || (await ChatModel.getMimeType(item.filename || item.url)),
                  };
                }
              }

              return item;
            }),
          ),
        };
      }),
    );
  }

  /**
   * Performs postprocessing operations after handling output
   *
   * Primarily updates token usage statistics in the context
   *
   * @param input Input message
   * @param output Output message
   * @param options Options for invoking the agent
   */
  protected override async postprocess(
    input: ChatModelInput,
    output: ChatModelOutput,
    options: AgentInvokeOptions,
  ): Promise<void> {
    super.postprocess(input, output, options);
    const { usage, thoughts, model } = output;

    if (thoughts) {
      logger.info(`Model Thoughts (${model}): ${thoughts}`);
    }

    if (usage) {
      options.context.usage.outputTokens += usage.outputTokens;
      options.context.usage.inputTokens += usage.inputTokens;
      if (usage.aigneHubCredits) options.context.usage.aigneHubCredits += usage.aigneHubCredits;
      if (usage.cacheCreationInputTokens)
        options.context.usage.cacheCreationInputTokens += usage.cacheCreationInputTokens;
      if (usage.cacheReadInputTokens)
        options.context.usage.cacheReadInputTokens += usage.cacheReadInputTokens;
      if (usage.creditPrefix) options.context.usage.creditPrefix = usage.creditPrefix;
    }
  }

  /**
   * Processes input messages and generates model responses
   *
   * This is the core method that must be implemented by all ChatModel subclasses.
   * It handles the communication with the underlying language model,
   * processes the input messages, and generates appropriate responses.
   *
   * Implementations should handle:
   * - Conversion of input format to model-specific format
   * - Sending requests to the language model
   * - Processing model responses
   * - Handling streaming responses if supported
   * - Proper error handling and retries
   * - Token counting and usage tracking
   * - Tool call processing if applicable
   *
   * @param input - The standardized input containing messages and model options
   * @param options - The options for invoking the agent, including context and limits
   * @returns A promise or direct value containing the model's response
   */
  abstract override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>>;

  protected override async processAgentOutput(
    input: ChatModelInput,
    output: Exclude<AgentResponse<ChatModelOutput>, AgentResponseStream<ChatModelOutput>>,
    options: AgentInvokeOptions,
  ): Promise<ChatModelOutput> {
    if (output.files) {
      const files = z.array(fileUnionContentSchema).parse(output.files);
      output = {
        ...output,
        files: await Promise.all(
          files.map((file) => this.transformFileType(input.outputFileType, file, options)),
        ),
      };
    }

    // Remove fields with `null` value for validation
    output = omitByDeep(output, (value) => isNil(value));

    const toolCalls = (output as ChatModelOutput).toolCalls;

    if (
      input.responseFormat?.type === "json_schema" &&
      // NOTE: Should not validate if there are tool calls
      !toolCalls?.length
    ) {
      output.json = this.validateJsonSchema(input.responseFormat.jsonSchema.schema, output.json);
    }

    // Restore original tool names in the output
    if (toolCalls?.length) {
      const toolsMap = input._toolsMap as Record<string, ChatModelInputTool> | undefined;
      if (toolsMap) {
        for (const toolCall of toolCalls) {
          const originalTool = toolsMap[toolCall.function.name];
          if (!originalTool) {
            throw new StructuredOutputError(
              `Tool "${toolCall.function.name}" not found in tools map`,
            );
          }

          toolCall.function.name = originalTool.function.name;
          toolCall.function.arguments = this.validateJsonSchema(
            originalTool.function.parameters,
            toolCall.function.arguments,
          );
        }
      }
    }

    return super.processAgentOutput(input, output, options);
  }

  protected validateJsonSchema<T>(schema: object, data: T, options?: { safe?: false }): T;
  protected validateJsonSchema<T>(
    schema: object,
    data: T,
    options: { safe: true },
  ): z.SafeParseReturnType<T, T>;
  protected validateJsonSchema<T>(
    schema: object,
    data: T,
    options?: { safe?: boolean },
  ): T | z.SafeParseReturnType<T, T>;
  protected validateJsonSchema<T>(
    schema: object,
    data: T,
    options?: { safe?: boolean },
  ): T | z.SafeParseReturnType<T, T> {
    const s = wrapAutoParseJsonSchema(convertJsonSchemaToZod(schema as JSONSchema));

    const r = s.safeParse(data);

    if (options?.safe) return r;

    if (r.error) {
      throw new StructuredOutputError(
        `Output JSON does not conform to the provided JSON schema: ${r.error.errors.map((i) => `${i.path}: ${i.message}`).join(", ")}`,
      );
    }

    return r.data;
  }
}

/**
 * Input message format for ChatModel
 *
 * Contains an array of messages to send to the model, response format settings,
 * tool definitions, and model-specific options
 *
 * @example
 * Here's a basic ChatModel input example:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model}
 *
 * @example
 * Here's an example with tool calling:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model-tools}
 */
export interface ChatModelInput extends Message {
  /**
   * Array of messages to send to the model
   */
  messages: ChatModelInputMessage[];

  /**
   * Specifies the expected response format
   */
  responseFormat?: ChatModelInputResponseFormat;

  outputFileType?: FileType;

  /**
   * List of tools available for the model to use
   */
  tools?: ChatModelInputTool[];

  /**
   * Specifies the tool selection strategy
   */
  toolChoice?: ChatModelInputToolChoice;

  /**
   * Model-specific configuration options
   */
  modelOptions?: ChatModelInputOptions;
}

/**
 * Message role types
 *
 * - system: System instructions
 * - user: User messages
 * - agent: Agent/assistant messages
 * - tool: Tool call responses
 */
export type Role = "system" | "user" | "agent" | "tool";

export const roleSchema = z.union([
  z.literal("system"),
  z.literal("user"),
  z.literal("agent"),
  z.literal("tool"),
]);

/**
 * Structure of input messages
 *
 * Defines the format of each message sent to the model, including
 * role, content, and tool call related information
 */
export interface ChatModelInputMessage {
  /**
   * Role of the message (system, user, agent, or tool)
   */
  role: Role;

  /**
   * Message content, can be text or multimodal content array
   */
  content?: ChatModelInputMessageContent;

  /**
   * Tool call details when the agent wants to execute tool calls
   */
  toolCalls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: Message };
    metadata?: Record<string, any>;
  }[];

  /**
   * For tool response messages, specifies the corresponding tool call ID
   */
  toolCallId?: string;

  /**
   * Name of the message sender (for multi-agent scenarios)
   */
  name?: string;

  /**
   * Cache control marker for the entire message (only supported by Claude)
   *
   * This is syntactic sugar that applies cacheControl to the last content block
   * of the message. See {@link CacheControl} for details.
   */
  cacheControl?: CacheControl;
}

/**
 * Type of input message content
 *
 * Can be a simple string, or a mixed array of text and image content
 */
export type ChatModelInputMessageContent = string | UnionContent[];

/**
 * Text content type
 *
 * Used for text parts of message content
 */
export type TextContent = {
  type: "text";
  text: string;

  isThinking?: boolean;

  /**
   * Cache control marker (only supported by Claude)
   *
   * When set, this content block will be marked as a cache breakpoint.
   * See {@link CacheControl} for details.
   */
  cacheControl?: CacheControl;
};

export const textContentSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  cacheControl: optionalize(
    z.object({
      type: z.literal("ephemeral"),
      ttl: optionalize(z.union([z.literal("5m"), z.literal("1h")])),
    }),
  ),
});

export type UnionContent = TextContent | FileUnionContent;

export const unionContentSchema = z.discriminatedUnion("type", [
  textContentSchema,
  localContentSchema,
  urlContentSchema,
  fileContentSchema,
]);

const chatModelInputMessageSchema = z.object({
  role: z.union([z.literal("system"), z.literal("user"), z.literal("agent"), z.literal("tool")]),
  content: optionalize(z.union([z.string(), z.array(unionContentSchema)])),
  toolCalls: optionalize(
    z.array(
      z.object({
        id: z.string(),
        type: z.literal("function"),
        function: z.object({
          name: z.string(),
          arguments: z.record(z.string(), z.unknown()),
        }),
        metadata: optionalize(z.record(z.string(), z.unknown())),
      }),
    ),
  ),
  toolCallId: optionalize(z.string()),
  name: optionalize(z.string()),
  cacheControl: optionalize(
    z.object({
      type: z.literal("ephemeral"),
      ttl: optionalize(z.union([z.literal("5m"), z.literal("1h")])),
    }),
  ),
});

/**
 * Model response format settings
 *
 * Can be specified as plain text format or according to a JSON Schema
 */
export type ChatModelInputResponseFormat =
  | { type: "text" }
  | {
      type: "json_schema";
      jsonSchema: {
        name: string;
        description?: string;
        schema: Record<string, unknown>;
        strict?: boolean;
      };
    };

const chatModelInputResponseFormatSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text") }),
  z.object({
    type: z.literal("json_schema"),
    jsonSchema: z.object({
      name: z.string(),
      description: optionalize(z.string()),
      schema: z.record(z.string(), z.unknown()),
      strict: optionalize(z.boolean()),
    }),
  }),
]);

/**
 * Tool definition provided to the model
 *
 * Defines a function tool, including name, description and parameter structure
 *
 * @example
 * Here's an example showing how to use tools:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model-tools}
 */
export interface ChatModelInputTool {
  /**
   * Tool type, currently only "function" is supported
   */
  type: "function";

  /**
   * Function tool definition
   */
  function: {
    /**
     * Function name
     */
    name: string;

    /**
     * Function description
     */
    description?: string;

    /**
     * Function parameter structure definition
     */
    parameters: object;
  };

  /**
   * Provider-specific metadata for the tool
   * For example, Gemini's thought_signature
   */
  metadata?: Record<string, any>;

  /**
   * Cache control marker (only supported by Claude)
   *
   * When set, this tool definition will be marked as a cache breakpoint.
   * Typically applied to the last tool in the tools array.
   * See {@link CacheControl} for details.
   */
  cacheControl?: CacheControl;
}

const chatModelInputToolSchema = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    description: optionalize(z.string()),
    parameters: z.record(z.string(), z.unknown()),
  }),
  metadata: optionalize(z.record(z.string(), z.unknown())),
  cacheControl: optionalize(
    z.object({
      type: z.literal("ephemeral"),
      ttl: optionalize(z.union([z.literal("5m"), z.literal("1h")])),
    }),
  ),
});

/**
 * Tool selection strategy
 *
 * Determines how the model selects and uses tools:
 * - "auto": Automatically decides whether to use tools
 * - "none": Does not use any tools
 * - "required": Must use tools
 * - object: Specifies a particular tool function
 *
 * @example
 * Here's an example showing how to use tools:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model-tools}
 */
export type ChatModelInputToolChoice =
  | "auto"
  | "none"
  | "required"
  | { type: "function"; function: { name: string; description?: string } };

const chatModelInputToolChoiceSchema = z.union([
  z.literal("auto"),
  z.literal("none"),
  z.literal("required"),
  chatModelInputToolSchema,
]);

export type Modality = "text" | "image" | "audio";

/**
 * Cache control marker for prompt caching
 *
 * Used to mark content blocks, messages, or tools for caching.
 * Currently only supported by Anthropic (Claude) models.
 */
export interface CacheControl {
  /**
   * Cache type (currently only "ephemeral" is supported)
   */
  type: "ephemeral";

  /**
   * Cache TTL (Time To Live)
   * - "5m": 5 minutes (default)
   * - "1h": 1 hour
   */
  ttl?: "5m" | "1h";
}

/**
 * Cache configuration options
 *
 * Controls how prompt caching is used for supported providers.
 * Prompt caching can significantly reduce costs and latency by reusing
 * previously processed prompts (system messages, tool definitions, etc.).
 */
export interface CacheConfig {
  /**
   * Whether to enable prompt caching
   *
   * - OpenAI: Ignored (always enabled automatically)
   * - Gemini: Controls explicit caching
   * - Claude: Controls whether to add cache_control markers
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * Cache TTL (Time To Live)
   *
   * - OpenAI: Ignored (automatic)
   * - Gemini: Supports custom seconds
   * - Claude: Only supports "5m" or "1h"
   *
   * @default "5m"
   */
  ttl?: "5m" | "1h" | number;

  /**
   * Caching strategy
   *
   * - "auto": Automatically add cache breakpoints at optimal locations
   * - "manual": Require explicit cacheControl markers on messages/tools
   *
   * @default "auto"
   */
  strategy?: "auto" | "manual";

  /**
   * Auto cache breakpoint locations (only effective when strategy="auto")
   *
   * @default { tools: true, system: true, lastMessage: false }
   */
  autoBreakpoints?: {
    /** Cache tool definitions */
    tools?: boolean;
    /** Cache system messages */
    system?: boolean;
    /** Cache last message in conversation history */
    lastMessage?: boolean;
  };
}

/**
 * Default cache configuration
 *
 * Enables automatic caching for system messages and tool definitions,
 * which typically provides the best cost/performance tradeoff.
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: "5m",
  strategy: "auto",
  autoBreakpoints: {
    tools: true,
    system: true,
    lastMessage: false,
  },
};

/**
 * Model-specific configuration options
 *
 * Contains various parameters for controlling model behavior, such as model name, temperature, etc.
 */
export interface ChatModelInputOptions extends Record<string, unknown> {
  /**
   * Model name or version
   */
  model?: string;

  /**
   * Temperature parameter, controls randomness (0-1)
   */
  temperature?: number;

  /**
   * Top-p parameter, controls vocabulary diversity
   */
  topP?: number;

  /**
   * Frequency penalty parameter, reduces repetition
   */
  frequencyPenalty?: number;

  /**
   * Presence penalty parameter, encourages diversity
   */
  presencePenalty?: number;

  /**
   * Whether to allow parallel tool calls
   */
  parallelToolCalls?: boolean;

  modalities?: Modality[];

  preferInputFileType?: "file" | "url";

  reasoningEffort?: number | "minimal" | "low" | "medium" | "high";

  /**
   * Cache configuration for prompt caching
   *
   * Enables caching of system messages, tool definitions, and conversation history
   * to reduce costs and latency. See {@link CacheConfig} for details.
   *
   * @default DEFAULT_CACHE_CONFIG (enabled with auto strategy)
   */
  cacheConfig?: CacheConfig;
}

export type ChatModelInputOptionsWithGetter = GetterSchema<ChatModelInputOptions>;

const modelOptionsSchemaProperties = {
  model: z.string(),
  temperature: z.number(),
  topP: z.number(),
  frequencyPenalty: z.number(),
  presencePenalty: z.number(),
  parallelToolCalls: z.boolean().default(true),
  modalities: z.array(z.enum(["text", "image", "audio"])),
  reasoningEffort: z.union([
    z.number(),
    z.literal("minimal"),
    z.literal("low"),
    z.literal("medium"),
    z.literal("high"),
  ]),
  cacheConfig: z.object({
    enabled: optionalize(z.boolean().default(true)),
    ttl: optionalize(z.union([z.literal("5m"), z.literal("1h"), z.number()]).default("5m")),
    strategy: optionalize(z.union([z.literal("auto"), z.literal("manual")]).default("auto")),
    autoBreakpoints: optionalize(
      z.object({
        tools: optionalize(z.boolean().default(true)),
        system: optionalize(z.boolean().default(true)),
        lastMessage: optionalize(z.boolean().default(false)),
      }),
    ),
  }),
};

const modelOptionsSchema = z
  .object(
    Object.fromEntries(
      Object.entries(modelOptionsSchemaProperties).map(([key, schema]) => [
        key,
        optionalize(schema as ZodType),
      ]),
    ),
  )
  .passthrough();

const modelOptionsWithGetterSchema = z
  .object(
    Object.fromEntries(
      Object.entries(modelOptionsSchemaProperties).map(([key, schema]) => [
        key,
        optionalize(getterSchema(schema)),
      ]),
    ),
  )
  .passthrough();

const chatModelOptionsSchema = agentOptionsSchema.extend({
  model: optionalize(z.string()),
  modelOptions: optionalize(modelOptionsWithGetterSchema),
});

const chatModelInputSchema: z.ZodType<ChatModelInput> = z.object({
  messages: z.array(chatModelInputMessageSchema),
  responseFormat: optionalize(chatModelInputResponseFormatSchema),
  tools: optionalize(z.array(chatModelInputToolSchema)),
  toolChoice: optionalize(chatModelInputToolChoiceSchema),
  modelOptions: optionalize(modelOptionsSchema),
});

/**
 * Output message format for ChatModel
 *
 * Contains model response content, which can be text, JSON data, tool calls, and usage statistics
 *
 * @example
 * Here's a basic output example:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model}
 *
 * @example
 * Here's an example with tool calls:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model-tools}
 */
export interface ChatModelOutput extends Message {
  /**
   * Text format response content
   */
  text?: string;

  /**
   * Model's internal thoughts (if supported)
   */
  thoughts?: string;

  /**
   * JSON format response content
   */
  json?: object;

  /**
   * List of tools the model requested to call
   */
  toolCalls?: ChatModelOutputToolCall[];

  /**
   * Token usage statistics
   */
  usage?: ChatModelOutputUsage;

  /**
   * Model name or version used
   */
  model?: string;

  files?: FileUnionContent[];
}

/**
 * Tool call information in model output
 *
 * Describes tool calls requested by the model, including tool ID and call parameters
 *
 * @example
 * Here's an example with tool calls:
 * {@includeCode ../../test/agents/chat-model.test.ts#example-chat-model-tools}
 */
export interface ChatModelOutputToolCall {
  /**
   * Unique ID of the tool call
   */
  id: string;

  /**
   * Tool type, currently only "function" is supported
   */
  type: "function";

  /**
   * Function call details
   */
  function: {
    /**
     * Name of the function being called
     */
    name: string;

    /**
     * Arguments for the function call
     */
    arguments: Message;
  };

  /**
   * Provider-specific metadata for the tool call
   * For example, Gemini's thought_signature
   */
  metadata?: Record<string, any>;
}

const chatModelOutputToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    arguments: z.record(z.string(), z.unknown()),
  }),
  metadata: optionalize(z.record(z.string(), z.unknown())),
});

/**
 * Model usage statistics
 *
 * Records the number of input and output tokens for tracking model usage
 */
export interface ChatModelOutputUsage {
  /**
   * Number of input tokens
   */
  inputTokens: number;

  /**
   * Number of output tokens
   */
  outputTokens: number;

  /**
   * AIGNE Hub credit usage
   */
  aigneHubCredits?: number;

  /**
   * Number of tokens written to cache (first time caching)
   * Only applicable for providers that support explicit cache creation (e.g., Anthropic)
   */
  cacheCreationInputTokens?: number;

  /**
   * Number of tokens read from cache (cache hit)
   * Supported by OpenAI, Anthropic, and Gemini
   */
  cacheReadInputTokens?: number;

  /**
   * Credit prefix
   */
  creditPrefix?: "$" | "€" | "¥";
}

export const chatModelOutputUsageSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  aigneHubCredits: optionalize(z.number()),
  cacheCreationInputTokens: optionalize(z.number()),
  cacheReadInputTokens: optionalize(z.number()),
  creditPrefix: optionalize(z.union([z.literal("$"), z.literal("€"), z.literal("¥")])),
});

const chatModelOutputSchema: z.ZodType<ChatModelOutput> = z.object({
  text: optionalize(z.string()),
  thoughts: optionalize(z.string()),
  json: optionalize(z.record(z.string(), z.unknown())),
  toolCalls: optionalize(z.array(chatModelOutputToolCallSchema)),
  usage: optionalize(chatModelOutputUsageSchema),
  model: optionalize(z.string()),
  files: optionalize(z.array(fileUnionContentSchema)),
});
