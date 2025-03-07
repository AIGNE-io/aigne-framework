import { nanoid } from "nanoid";
import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources";
import { isNonNullable } from "../utils/type-utils";
import {
  ChatModel,
  type ChatModelInput,
  type ChatModelInputMessage,
  type ChatModelInputTool,
  type ChatModelOutput,
  type Role,
} from "./chat";

const CHAT_MODEL_OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

export class ChatModelOpenAI extends ChatModel {
  constructor(public config?: { apiKey: string; model: string }) {
    super();
  }

  private _client?: OpenAI;

  private get client() {
    if (!this.config?.apiKey) throw new Error("Api Key is required for ChatModelOpenAI");

    this._client ??= new OpenAI({ apiKey: this.config.apiKey });
    return this._client;
  }

  async process(input: ChatModelInput): Promise<ChatModelOutput> {
    const res = await this.client.chat.completions.create({
      model: this.config?.model || CHAT_MODEL_OPENAI_DEFAULT_MODEL,
      temperature: input.modelOptions?.temperature,
      top_p: input.modelOptions?.topP,
      frequency_penalty: input.modelOptions?.frequencyPenalty,
      presence_penalty: input.modelOptions?.presencePenalty,
      messages: await contentsFromInputMessages(input.messages),
      tools: toolsFromInputTools(input.tools),
      tool_choice: input.toolChoice,
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
          const c = toolCalls[call.index]!;

          if (call.type) c.type = call.type;

          c.function.name = c.function.name + (call.function?.name || "");
          c.args = c.args.concat(call.function?.arguments || "");
        }
      }

      if (choice?.delta.content) text += choice.delta.content;
    }

    const result: ChatModelOutput = { text };

    if (input.responseFormat?.type === "json_schema") {
      result.json = JSON.parse(text);
    }

    if (toolCalls.length) {
      result.toolCalls = toolCalls.map(({ args, ...c }) => ({
        ...c,
        function: { ...c.function, arguments: JSON.parse(args) },
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
  return messages.map((i) => ({
    role: ROLE_MAP[i.role] as any,
    content:
      typeof i.content === "string"
        ? i.content
        : (i.content
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
            .filter(isNonNullable) as any),
    tool_calls: i.toolCalls?.map((i) => ({
      ...i,
      function: {
        ...i.function,
        arguments: JSON.stringify(i.function.arguments),
      },
    })),
    tool_call_id: i.toolCallId,
    name: i.name,
  }));
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

function jsonSchemaToOpenAIJsonSchema(schema: any): any {
  if (schema?.type === "object") {
    const { required, properties } = schema;

    return {
      ...schema,
      properties: Object.fromEntries(
        Object.entries(properties).map(([key, value]: any) => {
          const valueSchema = jsonSchemaToOpenAIJsonSchema(value);

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
    return {
      ...schema,
      items: jsonSchemaToOpenAIJsonSchema(schema.items),
    };
  }

  return schema;
}
