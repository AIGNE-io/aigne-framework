import OpenAI from "openai";
import { mergeUsage } from "../utils/model-utils.js";
import type { ChatModelInput, ChatModelOutput } from "./chat-model.js";
import {
  OpenAIChatModel,
  type OpenAIChatModelOptions,
  contentsFromInputMessages,
  extractResultFromStream,
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
    const messages = await contentsFromInputMessages(input.messages);
    if (messages.length > 0 && messages.at(-1)?.role !== "user") {
      messages.push({ role: "user", content: "" });
    }

    const body: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.options?.model || GEMINI_DEFAULT_CHAT_MODEL,
      temperature: input.modelOptions?.temperature ?? this.modelOptions?.temperature,
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

    const tools = toolsFromInputTools(input.tools);
    const res = await this.client.chat.completions.create({
      ...body,
      response_format: tools?.length
        ? undefined
        : input.responseFormat?.type === "json_schema"
          ? {
              type: "json_schema",
              json_schema: {
                ...input.responseFormat.jsonSchema,
                schema: jsonSchemaToOpenAIJsonSchema(input.responseFormat.jsonSchema.schema),
              },
            }
          : undefined,
      tools,
      tool_choice: input.toolChoice,
      parallel_tool_calls: !tools?.length
        ? undefined
        : (input.modelOptions?.parallelToolCalls ?? this.modelOptions?.parallelToolCalls),
    });

    const result = await extractResultFromStream(res);

    if (!result.toolCalls?.length && input.responseFormat?.type === "json_schema" && result.text) {
      const output = await this.requestStructuredOutput(body, input.responseFormat);

      return {
        ...output,
        usage: mergeUsage(result.usage, output.usage),
      };
    }
    return result;
  }

  private async requestStructuredOutput(
    body: OpenAI.Chat.ChatCompletionCreateParamsStreaming,
    responseFormat: ChatModelInput["responseFormat"],
  ): Promise<ChatModelOutput> {
    if (responseFormat?.type !== "json_schema") {
      throw new Error("Expected json_schema response format");
    }

    const res = await this.client.chat.completions.create({
      ...body,
      response_format: {
        type: "json_schema",
        json_schema: {
          ...responseFormat.jsonSchema,
          schema: jsonSchemaToOpenAIJsonSchema(responseFormat.jsonSchema.schema),
        },
      },
    });

    return extractResultFromStream(res, responseFormat?.type === "json_schema");
  }
}
