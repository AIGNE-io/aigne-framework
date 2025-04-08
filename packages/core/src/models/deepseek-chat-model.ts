import { nanoid } from "nanoid";
import { OpenAI } from "openai";
import { SystemMessageTemplate } from "../prompt/template.js";
import { parseJSON } from "../utils/json-schema.js";
import { checkArguments } from "../utils/type-utils.js";
import type { ChatModelInput, ChatModelOutput, ChatModelOutputUsage } from "./chat-model.js";
import { ChatModel } from "./chat-model.js";
import {
  type OpenAIChatModelOptions,
  contentsFromInputMessages,
  openAIChatModelOptionsSchema,
  toolsFromInputTools,
} from "./openai-chat-model.js";

const DEEPSEEK_DEFAULT_CHAT_MODEL = "deepseek-chat";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export class DeepSeekChatModel extends ChatModel {
  constructor(public options?: OpenAIChatModelOptions) {
    if (options) checkArguments("DeepSeekChatModel", openAIChatModelOptionsSchema, options);
    super();
  }

  private _client?: OpenAI;

  get client() {
    const apiKey = this.options?.apiKey || process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("Api Key is required for DeepSeekChatModel");

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
        `The response should be a JSON object following this schema: 
        ${JSON.stringify((input.responseFormat as { jsonSchema: { schema: Record<string, unknown> } }).jsonSchema)}`,
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
      tools: toolsFromInputTools(input.tools),
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

    let text = "";
    const toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & {
      args: string;
    })[] = [];
    let usage: ChatModelOutputUsage | undefined;

    for await (const chunk of res) {
      const choice = chunk.choices?.[0];

      if (choice?.delta.tool_calls?.length) {
        for (const call of choice.delta.tool_calls) {
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
}
