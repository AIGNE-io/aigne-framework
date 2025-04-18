import { nanoid } from "nanoid";
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ResponseFormatJSONSchema,
} from "openai/resources";
import type { Stream } from "openai/streaming.js";
import { z } from "zod";
import { parseJSON } from "../utils/json-schema.js";
import { mergeUsage } from "../utils/model-utils.js";
import { getJsonOutputPrompt } from "../utils/prompts.js";
import { checkArguments, isNonNullable } from "../utils/type-utils.js";
import {
  ChatModel,
  type ChatModelInput,
  type ChatModelInputMessage,
  type ChatModelInputTool,
  type ChatModelOptions,
  type ChatModelOutput,
  type ChatModelOutputUsage,
  type Role,
} from "./chat-model.js";

const CHAT_MODEL_OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

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
  }

  protected _client?: OpenAI;
  protected apiKeyEnvName = "OPENAI_API_KEY";
  protected apiKeyDefault: string | undefined;
  protected supportsNativeStructuredOutputs = true;
  protected supportsEndWithSystemMessage = true;
  protected supportsToolsUseWithJsonSchema = true;
  protected supportsParallelToolCalls = true;
  protected supportsToolsEmptyParameters = true;

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

  async process(input: ChatModelInput): Promise<ChatModelOutput> {
    const body: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.options?.model || CHAT_MODEL_OPENAI_DEFAULT_MODEL,
      temperature: input.modelOptions?.temperature ?? this.modelOptions?.temperature,
      top_p: input.modelOptions?.topP ?? this.modelOptions?.topP,
      frequency_penalty:
        input.modelOptions?.frequencyPenalty ?? this.modelOptions?.frequencyPenalty,
      presence_penalty: input.modelOptions?.presencePenalty ?? this.modelOptions?.presencePenalty,
      messages: await this.getRunMessages(input),
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

    const result = await extractResultFromStream(stream, jsonMode);

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

    return extractResultFromStream(res, jsonMode);
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

export async function extractResultFromStream(
  stream: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>,
  jsonMode = false,
) {
  let text = "";
  const toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & {
    args: string;
  })[] = [];
  let usage: ChatModelOutputUsage | undefined;
  let model: string | undefined;

  for await (const chunk of stream) {
    const choice = chunk.choices?.[0];
    model ??= chunk.model;

    if (choice?.delta.tool_calls?.length) {
      for (const call of choice.delta.tool_calls) {
        // Gemini not support tool call delta
        if (call.index !== undefined) {
          handleToolCallDelta(toolCalls, call);
        } else {
          handleCompleteToolCall(toolCalls, call);
        }
      }
    }

    if (choice?.delta.content) text += choice.delta.content;

    if (chunk.usage) {
      usage = {
        inputTokens: chunk.usage.prompt_tokens,
        outputTokens: chunk.usage.completion_tokens,
      };
    }
  }

  const result: ChatModelOutput = {
    usage,
    model,
  };

  if (jsonMode && text) {
    result.json = parseJSON(text);
  } else {
    result.text = text;
  }

  if (toolCalls.length) {
    result.toolCalls = toolCalls.map(({ args, ...c }) => ({
      ...c,
      function: { ...c.function, arguments: parseJSON(args) },
    }));
  }

  return result;
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
