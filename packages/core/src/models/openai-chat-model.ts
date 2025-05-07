import { nanoid } from "nanoid";
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ResponseFormatJSONSchema,
} from "openai/resources";
import type { Stream } from "openai/streaming.js";
import { z } from "zod";
import type { AgentInvokeOptions, AgentResponse, AgentResponseChunk } from "../agents/agent.js";
import type { Context } from "../aigne/context.js";
import { parseJSON } from "../utils/json-schema.js";
import { mergeUsage } from "../utils/model-utils.js";
import { getJsonOutputPrompt } from "../utils/prompts.js";
import { agentResponseStreamToObject } from "../utils/stream-utils.js";
import { checkArguments, isNonNullable } from "../utils/type-utils.js";
import {
  ChatModel,
  type ChatModelInput,
  type ChatModelInputMessage,
  type ChatModelInputTool,
  type ChatModelOptions,
  type ChatModelOutput,
  type Role,
} from "./chat-model.js";

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

export interface OpenAIChatModelOptions {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  modelOptions?: ChatModelOptions;
}

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

export class OpenAIChatModel extends ChatModel {
  constructor(public options?: OpenAIChatModelOptions) {
    super();
    if (options) checkArguments(this.name, openAIChatModelOptionsSchema, options);

    const preset = options?.model ? OPENAI_CHAT_MODEL_CAPABILITIES[options.model] : undefined;
    Object.assign(this, preset);
  }

  protected _client?: OpenAI;
  protected apiKeyEnvName = "OPENAI_API_KEY";
  protected apiKeyDefault: string | undefined;
  protected supportsNativeStructuredOutputs = true;
  protected supportsEndWithSystemMessage = true;
  protected supportsToolsUseWithJsonSchema = true;
  protected supportsParallelToolCalls = true;
  protected supportsToolsEmptyParameters = true;
  protected supportsToolStreaming = true;
  protected supportsTemperature = true;

  get client() {
    const apiKey = this.options?.apiKey || process.env[this.apiKeyEnvName] || this.apiKeyDefault;
    if (!apiKey) throw new Error(`Api Key is required for ${this.name}`);

    this._client ??= new OpenAI({
      baseURL: this.options?.baseURL,
      apiKey,
    });
    return this._client;
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  async process(
    input: ChatModelInput,
    _context: Context,
    options?: AgentInvokeOptions,
  ): Promise<AgentResponse<ChatModelOutput>> {
    const messages = await this.getRunMessages(input);
    const body: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.options?.model || CHAT_MODEL_OPENAI_DEFAULT_MODEL,
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

    const { jsonMode, responseFormat } = await this.getRunResponseFormat(input);
    const stream = await this.client.chat.completions.create({
      ...body,
      tools: toolsFromInputTools(input.tools, {
        addTypeToEmptyParameters: !this.supportsToolsEmptyParameters,
      }),
      tool_choice: input.toolChoice,
      parallel_tool_calls: this.getParallelToolCalls(input),
      response_format: responseFormat,
    });

    if (options?.streaming && input.responseFormat?.type !== "json_schema") {
      return await this.extractResultFromStream(stream, false, true);
    }

    const result = await this.extractResultFromStream(stream, jsonMode);

    if (
      !this.supportsToolsUseWithJsonSchema &&
      !result.toolCalls?.length &&
      input.responseFormat?.type === "json_schema" &&
      result.text
    ) {
      const output = await this.requestStructuredOutput(body, input.responseFormat);
      return { ...output, usage: mergeUsage(result.usage, output.usage) };
    }

    return result;
  }

  private getParallelToolCalls(input: ChatModelInput): boolean | undefined {
    if (!this.supportsParallelToolCalls) return undefined;
    if (!input.tools?.length) return undefined;
    return input.modelOptions?.parallelToolCalls ?? this.modelOptions?.parallelToolCalls;
  }

  private async getRunMessages(input: ChatModelInput): Promise<ChatCompletionMessageParam[]> {
    const messages = await contentsFromInputMessages(input.messages);

    if (!this.supportsEndWithSystemMessage && messages.at(-1)?.role !== "user") {
      messages.push({ role: "user", content: "" });
    }

    if (!this.supportsToolsUseWithJsonSchema && input.tools?.length) return messages;
    if (this.supportsNativeStructuredOutputs) return messages;

    if (input.responseFormat?.type === "json_schema") {
      messages.unshift({
        role: "system",
        content: getJsonOutputPrompt(input.responseFormat.jsonSchema.schema),
      });
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
      return { jsonMode, responseFormat: jsonMode ? { type: "json_object" } : undefined };
    }

    if (input.responseFormat?.type === "json_schema") {
      return {
        jsonMode: true,
        responseFormat: {
          type: "json_schema",
          json_schema: {
            ...input.responseFormat.jsonSchema,
            schema: jsonSchemaToOpenAIJsonSchema(input.responseFormat.jsonSchema.schema),
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
    const res = await this.client.chat.completions.create({
      ...body,
      response_format: resolvedResponseFormat,
    });

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
                  json: parseJSON(text),
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
                    function: { ...c.function, arguments: parseJSON(args) },
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
}

export const ROLE_MAP: { [key in Role]: ChatCompletionMessageParam["role"] } = {
  system: "system",
  user: "user",
  agent: "assistant",
  tool: "tool",
} as const;

export async function contentsFromInputMessages(
  messages: ChatModelInputMessage[],
): Promise<ChatCompletionMessageParam[]> {
  return messages.map(
    (i) =>
      ({
        role: ROLE_MAP[i.role],
        content:
          typeof i.content === "string"
            ? i.content
            : i.content
                ?.map((c) => {
                  if (c.type === "text") {
                    return { type: "text" as const, text: c.text };
                  }
                  if (c.type === "image_url") {
                    return {
                      type: "image_url" as const,
                      image_url: { url: c.url },
                    };
                  }
                })
                .filter(isNonNullable),
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
  );
}

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

export function jsonSchemaToOpenAIJsonSchema(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  if (schema?.type === "object") {
    const { required, properties } = schema as {
      required?: string[];
      properties: Record<string, unknown>;
    };

    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(properties).map(([key, value]) => {
          const valueSchema = jsonSchemaToOpenAIJsonSchema(value as Record<string, unknown>);

          // NOTE: All fields must be required https://platform.openai.com/docs/guides/structured-outputs/all-fields-must-be-required
          return [
            key,
            required?.includes(key) ? valueSchema : { anyOf: [valueSchema, { type: ["null"] }] },
          ];
        }),
      ),
      required: Object.keys(properties),
    };
  }

  if (schema?.type === "array") {
    const { items } = schema as { items: Record<string, unknown> };

    return {
      ...schema,
      items: jsonSchemaToOpenAIJsonSchema(items),
    };
  }

  return schema;
}

function handleToolCallDelta(
  toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & { args: string })[],
  call: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall & { index: number },
) {
  toolCalls[call.index] ??= {
    id: call.id || nanoid(),
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
  toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & { args: string })[],
  call: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall,
) {
  toolCalls.push({
    id: call.id || nanoid(),
    type: "function" as const,
    function: {
      name: call.function?.name || "",
      arguments: parseJSON(call.function?.arguments || "{}"),
    },
    args: call.function?.arguments || "",
  });
}
