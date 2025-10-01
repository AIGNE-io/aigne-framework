import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  type AgentResponse,
  type AgentResponseChunk,
  ChatModel,
  type ChatModelInput,
  type ChatModelInputMessage,
  type ChatModelInputTool,
  type ChatModelOptions,
  type ChatModelOutput,
  createRoleMapper,
  STANDARD_ROLE_MAP,
  safeParseJSON,
} from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { mergeUsage } from "@aigne/core/utils/model-utils.js";
import { getJsonOutputPrompt } from "@aigne/core/utils/prompts.js";
import { agentResponseStreamToObject } from "@aigne/core/utils/stream-utils.js";
import {
  checkArguments,
  isNonNullable,
  type PromiseOrValue,
} from "@aigne/core/utils/type-utils.js";
import { v7 } from "@aigne/uuid";
import type { ClientOptions, OpenAI } from "openai";
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ResponseFormatJSONSchema,
} from "openai/resources";
import type { Stream } from "openai/streaming.js";
import { z } from "zod";
import { CustomOpenAI } from "./openai.js";

const CHAT_MODEL_OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

export interface OpenAIChatModelCapabilities {
  supportsNativeStructuredOutputs: boolean;
  supportsEndWithSystemMessage: boolean;
  supportsToolsUseWithJsonSchema: boolean;
  supportsParallelToolCalls: boolean;
  supportsToolsEmptyParameters: boolean;
  supportsToolStreaming: boolean;
  supportsTemperature: boolean;
}

const OPENAI_CHAT_MODEL_CAPABILITIES: Record<string, Partial<OpenAIChatModelCapabilities>> = {
  "o4-mini": { supportsParallelToolCalls: false, supportsTemperature: false },
  "o3-mini": { supportsParallelToolCalls: false, supportsTemperature: false },
};

/**
 * Configuration options for OpenAI Chat Model
 */
export interface OpenAIChatModelOptions extends ChatModelOptions {
  /**
   * API key for OpenAI API
   *
   * If not provided, will look for OPENAI_API_KEY in environment variables
   */
  apiKey?: string;

  /**
   * Base URL for OpenAI API
   *
   * Useful for proxies or alternate endpoints
   */
  baseURL?: string;

  /**
   * Client options for OpenAI API
   */
  clientOptions?: Partial<ClientOptions>;
}

/**
 * @hidden
 */
export const openAIChatModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  baseURL: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z
    .object({
      model: z.string().optional(),
      temperature: z.number().optional(),
      topP: z.number().optional(),
      frequencyPenalty: z.number().optional(),
      presencePenalty: z.number().optional(),
      parallelToolCalls: z.boolean().optional().default(true),
    })
    .optional(),
});

/**
 * Implementation of the ChatModel interface for OpenAI's API
 *
 * This model provides access to OpenAI's capabilities including:
 * - Text generation
 * - Tool use with parallel tool calls
 * - JSON structured output
 * - Image understanding
 *
 * Default model: 'gpt-4o-mini'
 *
 * @example
 * Here's how to create and use an OpenAI chat model:
 * {@includeCode ../test/openai-chat-model.test.ts#example-openai-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../test/openai-chat-model.test.ts#example-openai-chat-model-stream}
 */
export class OpenAIChatModel extends ChatModel {
  constructor(public override options?: OpenAIChatModelOptions) {
    super();
    if (options) checkArguments(this.name, openAIChatModelOptionsSchema, options);

    const preset = options?.model ? OPENAI_CHAT_MODEL_CAPABILITIES[options.model] : undefined;
    Object.assign(this, preset);
  }

  /**
   * @hidden
   */
  protected _client?: OpenAI;

  protected apiKeyEnvName = "OPENAI_API_KEY";
  protected apiKeyDefault: string | undefined;
  protected supportsNativeStructuredOutputs = true;
  protected supportsToolsUseWithJsonSchema = true;
  protected override supportsParallelToolCalls = true;
  protected supportsToolsEmptyParameters = true;
  protected supportsToolStreaming = true;
  protected supportsTemperature = true;

  get client() {
    const { apiKey, url } = this.credential;
    if (!apiKey)
      throw new Error(
        `${this.name} requires an API key. Please provide it via \`options.apiKey\`, or set the \`${this.apiKeyEnvName}\` environment variable`,
      );

    this._client ??= new CustomOpenAI({
      baseURL: url,
      apiKey,
      ...this.options?.clientOptions,
    });
    return this._client;
  }

  override get credential() {
    return {
      url: this.options?.baseURL || process.env.OPENAI_BASE_URL,
      apiKey: this.options?.apiKey || process.env[this.apiKeyEnvName] || this.apiKeyDefault,
      model: this.options?.model || CHAT_MODEL_OPENAI_DEFAULT_MODEL,
    };
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  /**
   * Process the input and generate a response
   * @param input The input to process
   * @returns The generated response
   */
  override process(
    input: ChatModelInput,
    _options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this._process(input);
  }

  private async _process(input: ChatModelInput): Promise<AgentResponse<ChatModelOutput>> {
    const messages = await this.getRunMessages(input);
    const model = input.modelOptions?.model || this.credential.model;

    const body: OpenAI.Chat.ChatCompletionCreateParams = {
      model,
      temperature: this.supportsTemperature
        ? (input.modelOptions?.temperature ?? this.modelOptions?.temperature)
        : undefined,
      top_p: input.modelOptions?.topP ?? this.modelOptions?.topP,
      frequency_penalty:
        input.modelOptions?.frequencyPenalty ?? this.modelOptions?.frequencyPenalty,
      presence_penalty: input.modelOptions?.presencePenalty ?? this.modelOptions?.presencePenalty,
      messages,
      stream_options: {
        include_usage: true,
      },
      stream: true,
    };

    // For models that do not support tools use with JSON schema in same request,
    // so we need to handle the case where tools are not used and responseFormat is json
    if (!input.tools?.length && input.responseFormat?.type === "json_schema") {
      return await this.requestStructuredOutput(body, input.responseFormat);
    }

    const { jsonMode, responseFormat } = await this.getRunResponseFormat(input);
    const stream = (await this.client.chat.completions.create({
      ...body,
      tools: toolsFromInputTools(input.tools, {
        addTypeToEmptyParameters: !this.supportsToolsEmptyParameters,
      }),
      tool_choice: input.toolChoice,
      parallel_tool_calls: this.getParallelToolCalls(input),
      response_format: responseFormat,
    })) as unknown as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;

    if (input.responseFormat?.type !== "json_schema") {
      return await this.extractResultFromStream(stream, false, true);
    }

    const result = await this.extractResultFromStream(stream, jsonMode);
    // Just return the result if it has tool calls
    if (result.toolCalls?.length || result.json) return result;

    // Try to parse the text response as JSON
    // If it matches the json_schema, return it as json
    const json = safeParseJSON(result.text || "");
    const validated = this.validateJsonSchema(input.responseFormat.jsonSchema.schema, json, {
      safe: true,
    });
    if (validated.success) {
      return { ...result, json: validated.data, text: undefined };
    }
    logger.warn(
      `${this.name}: Text response does not match JSON schema, trying to use tool to extract json `,
      {
        text: result.text,
      },
    );

    const output = await this.requestStructuredOutput(body, input.responseFormat);
    return { ...output, usage: mergeUsage(result.usage, output.usage) };
  }

  private getParallelToolCalls(input: ChatModelInput): boolean | undefined {
    if (!this.supportsParallelToolCalls) return undefined;
    if (!input.tools?.length) return undefined;
    return input.modelOptions?.parallelToolCalls ?? this.modelOptions?.parallelToolCalls;
  }

  protected async getRunMessages(input: ChatModelInput): Promise<ChatCompletionMessageParam[]> {
    const messages = await contentsFromInputMessages(input.messages);

    if (input.responseFormat?.type === "json_schema") {
      if (
        !this.supportsNativeStructuredOutputs ||
        (!this.supportsToolsUseWithJsonSchema && input.tools?.length)
      ) {
        messages.unshift({
          role: "system",
          content: getJsonOutputPrompt(input.responseFormat.jsonSchema.schema),
        });
      }
    }
    return messages;
  }

  private async getRunResponseFormat(input: Partial<ChatModelInput>): Promise<{
    jsonMode: boolean;
    responseFormat: ResponseFormatJSONSchema | { type: "json_object" } | undefined;
  }> {
    if (!this.supportsToolsUseWithJsonSchema && input.tools?.length)
      return { jsonMode: false, responseFormat: undefined };

    if (!this.supportsNativeStructuredOutputs) {
      const jsonMode = input.responseFormat?.type === "json_schema";
      return {
        jsonMode,
        responseFormat: jsonMode ? { type: "json_object" } : undefined,
      };
    }

    if (input.responseFormat?.type === "json_schema") {
      return {
        jsonMode: true,
        responseFormat: {
          type: "json_schema",
          json_schema: {
            ...input.responseFormat.jsonSchema,
            schema: this.jsonSchemaToOpenAIJsonSchema(input.responseFormat.jsonSchema.schema),
          },
        },
      };
    }

    return { jsonMode: false, responseFormat: undefined };
  }

  private async requestStructuredOutput(
    body: OpenAI.Chat.ChatCompletionCreateParamsStreaming,
    responseFormat: ChatModelInput["responseFormat"],
  ): Promise<ChatModelOutput> {
    if (responseFormat?.type !== "json_schema") {
      throw new Error("Expected json_schema response format");
    }

    const { jsonMode, responseFormat: resolvedResponseFormat } = await this.getRunResponseFormat({
      responseFormat,
    });
    const res = (await this.client.chat.completions.create({
      ...body,
      response_format: resolvedResponseFormat,
    })) as unknown as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>;

    return this.extractResultFromStream(res, jsonMode);
  }

  private async extractResultFromStream(
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
    jsonMode: boolean | undefined,
    streaming: true,
  ): Promise<ReadableStream<AgentResponseChunk<ChatModelOutput>>>;
  private async extractResultFromStream(
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
    jsonMode?: boolean,
    streaming?: false,
  ): Promise<ChatModelOutput>;
  private async extractResultFromStream(
    stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
    jsonMode?: boolean,
    streaming?: boolean,
  ): Promise<ReadableStream<AgentResponseChunk<ChatModelOutput>> | ChatModelOutput> {
    const result = new ReadableStream<AgentResponseChunk<ChatModelOutput>>({
      start: async (controller) => {
        try {
          let text = "";
          let refusal = "";
          const toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & {
            args: string;
          })[] = [];
          let model: string | undefined;

          for await (const chunk of stream) {
            const choice = chunk.choices?.[0];
            if (!model) {
              model = chunk.model;
              controller.enqueue({
                delta: {
                  json: {
                    model,
                  },
                },
              });
            }

            if (choice?.delta.tool_calls?.length) {
              for (const call of choice.delta.tool_calls) {
                if (this.supportsToolStreaming && call.index !== undefined) {
                  handleToolCallDelta(toolCalls, call);
                } else {
                  handleCompleteToolCall(toolCalls, call);
                }
              }
            }

            if (choice?.delta.content) {
              text += choice.delta.content;
              if (!jsonMode) {
                controller.enqueue({
                  delta: {
                    text: {
                      text: choice.delta.content,
                    },
                  },
                });
              }
            }

            if (choice?.delta.refusal) {
              refusal += choice.delta.refusal;
              if (!jsonMode) {
                controller.enqueue({
                  delta: {
                    text: { text: choice.delta.refusal },
                  },
                });
              }
            }

            if (chunk.usage) {
              controller.enqueue({
                delta: {
                  json: {
                    usage: {
                      inputTokens: chunk.usage.prompt_tokens,
                      outputTokens: chunk.usage.completion_tokens,
                    },
                  },
                },
              });
            }
          }

          text = text || refusal;
          if (jsonMode && text) {
            controller.enqueue({
              delta: {
                json: {
                  json: safeParseJSON(text),
                },
              },
            });
          }

          if (toolCalls.length) {
            controller.enqueue({
              delta: {
                json: {
                  toolCalls: toolCalls.map(({ args, ...c }) => ({
                    ...c,
                    function: { ...c.function, arguments: args ? safeParseJSON(args) : {} },
                  })),
                },
              },
            });
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return streaming ? result : await agentResponseStreamToObject(result);
  }

  /**
   * Controls how optional fields are handled in JSON schema conversion
   * - "anyOf": All fields are required but can be null (default)
   * - "optional": Fields marked as optional in schema remain optional
   */
  protected optionalFieldMode?: "anyOf" | "optional" = "anyOf";

  protected jsonSchemaToOpenAIJsonSchema(schema: Record<string, unknown>): Record<string, unknown> {
    if (schema?.type === "object") {
      const s = schema as {
        required?: string[];
        properties: Record<string, unknown>;
      };

      const required = this.optionalFieldMode === "anyOf" ? Object.keys(s.properties) : s.required;

      return {
        ...schema,
        properties: Object.fromEntries(
          Object.entries(s.properties).map(([key, value]) => {
            const valueSchema = this.jsonSchemaToOpenAIJsonSchema(value as Record<string, unknown>);

            // NOTE: All fields must be required https://platform.openai.com/docs/guides/structured-outputs/all-fields-must-be-required
            return [
              key,
              this.optionalFieldMode === "optional" || s.required?.includes(key)
                ? valueSchema
                : { anyOf: [valueSchema, { type: ["null"] }] },
            ];
          }),
        ),
        required,
      };
    }

    if (schema?.type === "array") {
      const { items } = schema as { items: Record<string, unknown> };

      return {
        ...schema,
        items: this.jsonSchemaToOpenAIJsonSchema(items),
      };
    }

    return schema;
  }
}

// Create role mapper for OpenAI (uses standard mapping)
const mapRole = createRoleMapper(STANDARD_ROLE_MAP);

/**
 * @hidden
 */
export async function contentsFromInputMessages(
  messages: ChatModelInputMessage[],
): Promise<ChatCompletionMessageParam[]> {
  return Promise.all(
    messages.map(
      async (i) =>
        ({
          role: mapRole(i.role),
          content:
            typeof i.content === "string"
              ? i.content
              : i.content &&
                (
                  await Promise.all(
                    i.content.map<Promise<ChatCompletionContentPart>>(async (c) => {
                      switch (c.type) {
                        case "text":
                          return { type: "text", text: c.text };
                        case "url":
                          return { type: "image_url", image_url: { url: c.url } };
                        case "file":
                          return {
                            type: "file",
                            file: { file_data: c.data, filename: c.filename },
                          };
                        case "local": {
                          throw new Error(
                            `Unsupported local file: ${c.path}, it should be converted to base64 at ChatModel`,
                          );
                        }
                      }
                    }),
                  )
                ).filter(isNonNullable),
          tool_calls: i.toolCalls?.map((i) => ({
            ...i,
            function: {
              ...i.function,
              arguments: JSON.stringify(i.function.arguments),
            },
          })),
          tool_call_id: i.toolCallId,
          name: i.name,
        }) as ChatCompletionMessageParam,
    ),
  );
}

/**
 * @hidden
 */
export function toolsFromInputTools(
  tools?: ChatModelInputTool[],
  options?: { addTypeToEmptyParameters?: boolean },
): ChatCompletionTool[] | undefined {
  return tools?.length
    ? tools.map((i) => {
        const parameters = i.function.parameters as Record<string, unknown>;
        if (options?.addTypeToEmptyParameters && Object.keys(parameters).length === 0) {
          parameters.type = "object";
        }
        return {
          type: "function",
          function: {
            name: i.function.name,
            description: i.function.description,
            parameters,
          },
        };
      })
    : undefined;
}

function handleToolCallDelta(
  toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & {
    args: string;
  })[],
  call: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall & {
    index: number;
  },
) {
  toolCalls[call.index] ??= {
    id: call.id || v7(),
    type: "function" as const,
    function: { name: "", arguments: {} },
    args: "",
  };
  const c = toolCalls[call.index];
  if (!c) throw new Error("Tool call not found");

  if (call.type) c.type = call.type;

  c.function.name = c.function.name + (call.function?.name || "");
  c.args = c.args.concat(call.function?.arguments || "");
}

function handleCompleteToolCall(
  toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & {
    args: string;
  })[],
  call: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall,
) {
  toolCalls.push({
    id: call.id || v7(),
    type: "function" as const,
    function: {
      name: call.function?.name || "",
      arguments: safeParseJSON(call.function?.arguments || "{}"),
    },
    args: call.function?.arguments || "",
  });
}

// safeParseJSON is now imported from @aigne/core
