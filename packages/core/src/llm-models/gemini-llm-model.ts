import {
  type Content,
  FunctionCallingMode,
  type FunctionDeclarationSchema,
  type GenerationConfig,
  type GenerativeModel,
  GoogleGenerativeAI,
  type Part,
  type ResponseSchema,
  SchemaType,
  type Tool,
  type ToolConfig,
} from "@google/generative-ai";
import { nanoid } from "nanoid";
import {
  LLMModel,
  type LLMModelInputMessage,
  type LLMModelInputs,
  type LLMModelOutputs,
} from "../llm-model";
import { isNonNullable } from "../utils/is-non-nullable";

export class GeminiLLMModel extends LLMModel {
  constructor(
    public config: {
      apiKey: string;
      model: string;
    },
  ) {
    super();
    this.client = new GoogleGenerativeAI(this.config.apiKey);
    this.model = this.client.getGenerativeModel({ model: this.config.model });
  }

  private client: GoogleGenerativeAI;

  private model: GenerativeModel;

  async *process(input: LLMModelInputs) {
    const res = await this.model.generateContentStream({
      contents: await contentsFromInputMessages(input.messages),
      tools: toolsFromInputTools(input.tools),
      toolConfig: toolConfigFromInputToolChoice(input.toolChoice),
      generationConfig: generationConfigFromInput(input),
    });

    const toolCalls: LLMModelOutputs["toolCalls"] = [];

    for await (const chunk of res.stream) {
      const choice = chunk.candidates?.[0];
      if (choice?.content.parts) {
        const calls = choice.content.parts
          .filter((i) => typeof i.functionCall === "object")
          .map((i) => ({
            id: nanoid(),
            type: "function" as const,
            function: {
              name: i.functionCall.name,
              arguments: JSON.stringify(i.functionCall.args),
            },
          }));

        if (calls.length) {
          toolCalls.push(...calls);
        }

        yield {
          $text: choice.content.parts
            .map((i) => i.text)
            .filter(Boolean)
            .join(""),

          delta: { toolCalls },
        };
      } else if (chunk.promptFeedback?.blockReason) {
        const { blockReason, blockReasonMessage } = chunk.promptFeedback;
        throw new Error(
          ["PROMPT_BLOCKED", blockReason, blockReasonMessage]
            .filter(Boolean)
            .join(" "),
        );
      }
    }
  }
}

async function contentsFromInputMessages(
  messages: LLMModelInputMessage[],
): Promise<Content[]> {
  const contents: Content[] = [];

  let prevMsg: Content | undefined;

  while (messages.length) {
    const message = messages.shift()!;

    if (!prevMsg || message.role !== prevMsg.role) {
      prevMsg = {
        role: message.role === "assistant" ? "model" : "user",
        parts: [],
      };
      contents.push(prevMsg);
    }

    if (typeof message.content === "string") {
      prevMsg.parts.push({ text: message.content });
    } else if (Array.isArray(message.content)) {
      const res = await Promise.all(message.content.map(resolveContent));
      prevMsg.parts.push(...res.filter(isNonNullable));
    }
  }

  return contents;
}

async function resolveContent(
  content: Exclude<LLMModelInputMessage["content"], "string">[number],
): Promise<Part | undefined> {
  if (typeof content === "string") return { text: content };

  if (content.type === "text" && content.text) {
    return { text: content.text };
  }

  if (content.type === "image_url") {
    const url = content.imageUrl.url;

    return { fileData: { mimeType: "image/jpeg", fileUri: url } };
  }

  return undefined;
}

function parameterSchemaToFunctionDeclarationSchema(schema: {
  [key: string]: any;
}): FunctionDeclarationSchema {
  if (schema.type === "object") {
    return {
      type: SchemaType.OBJECT,
      description: schema.description,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, s]: any) => [
          key,
          openAISchemaToGeminiSchema(s),
        ]),
      ),
      required: schema.required,
    };
  }

  throw new Error(`Unsupported schema type ${schema.type}`);
}

function generationConfigFromInput(input: LLMModelInputs): GenerationConfig {
  const jsonSchema =
    input.responseFormat?.type === "json_schema"
      ? input.responseFormat.jsonSchema
      : undefined;

  return {
    temperature: input.modelOptions?.temperature,
    topP: input.modelOptions?.topP,
    frequencyPenalty: input.modelOptions?.frequencyPenalty,
    presencePenalty: input.modelOptions?.presencePenalty,
    responseMimeType: jsonSchema ? "application/json" : undefined,
    responseSchema: jsonSchema
      ? openAISchemaToGeminiSchema(jsonSchema)
      : undefined,
  };
}

function toolConfigFromInputToolChoice(
  toolChoice?: LLMModelInputs["toolChoice"],
): ToolConfig | undefined {
  if (!toolChoice) return undefined;

  const selectedToolFunctionName =
    typeof toolChoice === "object" ? toolChoice.function.name : undefined;

  return !toolChoice
    ? undefined
    : {
        functionCallingConfig: {
          mode:
            toolChoice === "required" || selectedToolFunctionName
              ? FunctionCallingMode.ANY
              : toolChoice === "none"
                ? FunctionCallingMode.NONE
                : FunctionCallingMode.AUTO,
          allowedFunctionNames: selectedToolFunctionName
            ? [selectedToolFunctionName]
            : undefined,
        },
      };
}

function toolsFromInputTools(
  tools?: LLMModelInputs["tools"],
): Tool[] | undefined {
  return tools?.length
    ? [
        {
          functionDeclarations: tools.map((i) => ({
            name: i.function.name,
            description: i.function.description,
            parameters:
              !i.function.parameters ||
              Object.keys(i.function.parameters).length === 0
                ? undefined
                : parameterSchemaToFunctionDeclarationSchema(
                    i.function.parameters,
                  ),
          })),
        },
      ]
    : undefined;
}

function openAISchemaToGeminiSchema(schema: {
  [key: string]: any;
}): ResponseSchema {
  if (schema.type === "string") {
    return {
      type: SchemaType.STRING,
      description: schema.description,
    };
  }

  if (schema.type === "number") {
    return {
      type: SchemaType.NUMBER,
      description: schema.description,
    };
  }

  if (schema.type === "boolean") {
    return {
      type: SchemaType.BOOLEAN,
      description: schema.description,
    };
  }

  if (schema.type === "object") {
    return {
      type: SchemaType.OBJECT,
      description: schema.description,
      properties: Object.fromEntries(
        Object.entries(schema.properties).map(([key, s]: any) => [
          key,
          openAISchemaToGeminiSchema(s),
        ]),
      ),
      required: schema.required,
    };
  }
  if (schema.type === "array") {
    return {
      type: SchemaType.ARRAY,
      items: openAISchemaToGeminiSchema(schema.items),
    };
  }

  throw new Error(`Unsupported schema type ${schema.type}`);
}
