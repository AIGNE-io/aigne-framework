import { nanoid } from "nanoid";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources";
import { parseJSON } from "../utils/json-schema.js";
import { isNonNullable } from "../utils/type-utils.js";
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

export interface OpenAIChatModelOptions {
  apiKey?: string;
  baseURL?: string;
  model?: string;
  modelOptions?: ChatModelOptions;
}

export class OpenAIChatModel extends ChatModel {
  constructor(public options?: OpenAIChatModelOptions) {
    super();
  }

  private _client?: OpenAI;

  private get client() {
    if (!this.options?.apiKey) throw new Error("Api Key is required for OpenAIChatModel");

    this._client ??= new OpenAI({
      baseURL: this.options.baseURL,
      apiKey: this.options.apiKey,
    });
    return this._client;
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  async process(input: ChatModelInput): Promise<ChatModelOutput> {
    const res = await this.client.chat.completions.create({
      model: this.options?.model || CHAT_MODEL_OPENAI_DEFAULT_MODEL,
      temperature: input.modelOptions?.temperature ?? this.modelOptions?.temperature,
      top_p: input.modelOptions?.topP ?? this.modelOptions?.topP,
      frequency_penalty:
        input.modelOptions?.frequencyPenalty ?? this.modelOptions?.frequencyPenalty,
      presence_penalty: input.modelOptions?.presencePenalty ?? this.modelOptions?.presencePenalty,
      messages: await contentsFromInputMessages(input.messages),
      tools: toolsFromInputTools(input.tools),
      tool_choice: input.toolChoice,
      parallel_tool_calls: !input.tools?.length
        ? undefined
        : (input.modelOptions?.parallelToolCalls ?? this.modelOptions?.parallelToolCalls),
      response_format:
        input.responseFormat?.type === "json_schema"
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
    }

    const result: ChatModelOutput = {};

    if (input.responseFormat?.type === "json_schema" && text) {
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

const ROLE_MAP: { [key in Role]: ChatCompletionMessageParam["role"] } = {
  system: "system",
  user: "user",
  agent: "assistant",
  tool: "tool",
} as const;

async function contentsFromInputMessages(
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

function toolsFromInputTools(tools?: ChatModelInputTool[]): ChatCompletionTool[] | undefined {
  return tools?.length
    ? tools.map((i) => ({
        type: "function",
        function: {
          name: i.function.name,
          description: i.function.description,
          parameters: i.function.parameters as Record<string, unknown>,
        },
      }))
    : undefined;
}

function jsonSchemaToOpenAIJsonSchema(schema: Record<string, unknown>): Record<string, unknown> {
  if (schema?.type === "object") {
    const { required, properties } = schema as {
      required?: string[];
      properties: Record<string, unknown>;
    };

    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(properties || {}).map(([key, value]) => {
          const valueSchema = jsonSchemaToOpenAIJsonSchema(value as Record<string, unknown>);

          // NOTE: All fields must be required https://platform.openai.com/docs/guides/structured-outputs/all-fields-must-be-required
          return [
            key,
            required?.includes(key) ? valueSchema : { anyOf: [valueSchema, { type: ["null"] }] },
          ];
        }),
      ),
      required: Object.keys(properties || {}),
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
