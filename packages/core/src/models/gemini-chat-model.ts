import { nanoid } from "nanoid";
import OpenAI from "openai";
import { parseJSON } from "../utils/json-schema.js";
import {
  type ChatModelInput,
  type ChatModelOutput,
  type ChatModelOutputUsage,
  isJsonSchemaResponseFormat,
} from "./chat-model.js";
import {
  OpenAIChatModel,
  type OpenAIChatModelOptions,
  contentsFromInputMessages,
  jsonSchemaToOpenAIJsonSchema,
  toolsFromInputTools,
} from "./openai-chat-model.js";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_DEFAULT_CHAT_MODEL = "gemini-2.0-flash";

export class GeminiChatModel extends OpenAIChatModel {
  constructor(public options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || GEMINI_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || GEMINI_BASE_URL,
    });
  }

  override get client() {
    const apiKey = this.options?.apiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Api Key is required for GeminiChatModel");

    this._client ??= new OpenAI({
      baseURL: this.options?.baseURL || GEMINI_BASE_URL,
      apiKey,
    });
    return this._client;
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  async process(input: ChatModelInput): Promise<ChatModelOutput> {
    const res = await this.client.chat.completions.create({
      model: this.options?.model || GEMINI_DEFAULT_CHAT_MODEL,
      temperature: input.modelOptions?.temperature ?? this.modelOptions?.temperature,
      top_p: input.modelOptions?.topP ?? this.modelOptions?.topP,
      frequency_penalty:
        input.modelOptions?.frequencyPenalty ?? this.modelOptions?.frequencyPenalty,
      presence_penalty: input.modelOptions?.presencePenalty ?? this.modelOptions?.presencePenalty,
      messages: await contentsFromInputMessages(input.messages),
      tools: isJsonSchemaResponseFormat(input.responseFormat)
        ? undefined
        : toolsFromInputTools(input.tools),
      tool_choice: input.toolChoice,
      parallel_tool_calls: !input.tools?.length
        ? undefined
        : (input.modelOptions?.parallelToolCalls ?? this.modelOptions?.parallelToolCalls),
      response_format: isJsonSchemaResponseFormat(input.responseFormat)
        ? {
            type: "json_schema",
            json_schema: {
              ...input.responseFormat.jsonSchema,
              schema: jsonSchemaToOpenAIJsonSchema(input.responseFormat.jsonSchema.schema),
            },
          }
        : undefined,
      stream: true,
    });

    let text = "";
    const toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & {
      args: string;
    })[] = [];
    let usage: ChatModelOutputUsage | undefined;

    for await (const chunk of res) {
      const choice = chunk.choices?.[0];

      if (choice?.delta.tool_calls?.length) {
        for (const call of choice.delta.tool_calls) {
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
      }

      if (choice?.delta.content) text += choice.delta.content;

      if (chunk.usage) {
        usage = {
          promptTokens: chunk.usage.prompt_tokens,
          completionTokens: chunk.usage.completion_tokens,
        };
      }
    }

    const result: ChatModelOutput = {
      usage,
    };

    if (isJsonSchemaResponseFormat(input.responseFormat) && text) {
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
}
