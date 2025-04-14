import { OpenAI } from "openai";
import { SystemMessageTemplate } from "../prompt/template.js";
import { checkArguments } from "../utils/type-utils.js";
import type { ChatModelInput, ChatModelOutput } from "./chat-model.js";
import { ChatModel } from "./chat-model.js";
import {
  type OpenAIChatModelOptions,
  contentsFromInputMessages,
  extractResultFromStream,
  openAIChatModelOptionsSchema,
  toolsFromInputTools,
} from "./openai-chat-model.js";

const DEEPSEEK_DEFAULT_CHAT_MODEL = "deepseek-chat";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export class DeepSeekChatModel extends ChatModel {
  constructor(public options?: OpenAIChatModelOptions) {
    super();
    if (options) checkArguments(this.name, openAIChatModelOptionsSchema, options);
  }

  protected _client?: OpenAI;

  get client() {
    const apiKey = this.options?.apiKey || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error(`Api Key is required for ${this.name}`);

    this._client ??= new OpenAI({
      baseURL: this.options?.baseURL || DEEPSEEK_BASE_URL,
      apiKey,
    });
    return this._client;
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  async process(input: ChatModelInput): Promise<ChatModelOutput> {
    const jsonMode = input.responseFormat?.type === "json_schema";
    const messages = [...input.messages];

    if (jsonMode) {
      const systemPrompt = SystemMessageTemplate.from(
        `You must respond with a JSON object that strictly follows this schema. Do not include the schema definition in your response. Only return the actual JSON data that matches the schema structure: 
        ${JSON.stringify(
          (
            input.responseFormat as {
              jsonSchema: { schema: Record<string, unknown> };
            }
          ).jsonSchema,
        )}`,
      );
      messages.unshift(systemPrompt);
    }

    const res = await this.client.chat.completions.create({
      model: this.options?.model || DEEPSEEK_DEFAULT_CHAT_MODEL,
      temperature: input.modelOptions?.temperature ?? this.modelOptions?.temperature,
      top_p: input.modelOptions?.topP ?? this.modelOptions?.topP,
      frequency_penalty:
        input.modelOptions?.frequencyPenalty ?? this.modelOptions?.frequencyPenalty,
      presence_penalty: input.modelOptions?.presencePenalty ?? this.modelOptions?.presencePenalty,
      messages: await contentsFromInputMessages(messages),
      tools: toolsFromInputTools(input.tools, { addTypeToEmptyParameters: true }),
      tool_choice: input.toolChoice,
      parallel_tool_calls: !input.tools?.length
        ? undefined
        : (input.modelOptions?.parallelToolCalls ?? this.modelOptions?.parallelToolCalls),
      response_format: jsonMode ? { type: "json_object" } : undefined,
      stream_options: {
        include_usage: true,
      },
      stream: true,
    });

    return extractResultFromStream(res, jsonMode);
  }
}
