import { nanoid } from "nanoid";
import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources";
import {
  LLMModel,
  type LLMModelInputMessage,
  type LLMModelInputs,
  type LLMModelOutputs,
} from "../llm-model";
import { isNonNullable } from "../utils/is-non-nullable";

export class OpenaiLLMModel extends LLMModel {
  constructor(private config: { apiKey: string; model: string }) {
    super();
    this.client = new OpenAI({ apiKey: this.config.apiKey });
  }

  private client: OpenAI;

  setApiKey(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async *process(input: LLMModelInputs) {
    const res = await this.client.chat.completions.create({
      model: this.config.model,
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
                schema: jsonSchemaToOpenAIJsonSchema(
                  input.responseFormat.jsonSchema.schema,
                ),
              },
            }
          : undefined,
      stream: true,
    });

    const toolCalls: LLMModelOutputs["toolCalls"] = [];

    for await (const chunk of res) {
      const choice = chunk.choices?.[0];
      const calls = choice?.delta.tool_calls?.map((i) => ({
        id: i.id || nanoid(),
        type: "function" as const,
        function: {
          name: i.function?.name,
          arguments: i.function?.arguments,
        },
      }));

      if (calls?.length) {
        toolCalls.push(...calls);
      }

      yield {
        $text: choice?.delta.content || undefined,

        delta: { toolCalls },
      };
    }
  }
}

async function contentsFromInputMessages(
  messages: LLMModelInputMessage[],
): Promise<ChatCompletionMessageParam[]> {
  return messages.map((i) => ({
    role: i.role as any,
    content:
      typeof i.content === "string"
        ? i.content
        : (i.content
            .map((c) => {
              if (c.type === "text") {
                return { type: "text" as const, text: c.text };
              }
              if (c.type === "image_url") {
                return {
                  type: "image_url" as const,
                  image_url: { url: c.imageUrl.url },
                };
              }
            })
            .filter(isNonNullable) as any),
    tool_call_id: i.toolCallId,
  }));
}

function toolsFromInputTools(
  tools?: LLMModelInputs["tools"],
): ChatCompletionTool[] | undefined {
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
            required?.includes(key)
              ? valueSchema
              : { anyOf: [valueSchema, { type: ["null"] }] },
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
