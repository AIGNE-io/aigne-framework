import { z } from "zod";
import { Agent, type Message } from "../agents/agent.js";
import type { Context } from "../execution-engine/context.js";

export abstract class ChatModel extends Agent<ChatModelInput, ChatModelOutput> {
  constructor() {
    super({
      inputSchema: chatModelInputSchema,
      outputSchema: chatModelOutputSchema,
    });
  }

  protected override preprocess(input: ChatModelInput, context: Context): void {
    super.preprocess(input, context);
    const { limits, usage } = context;
    const usedTokens = usage.completionTokens + usage.promptTokens;
    if (limits?.maxTokens && usedTokens >= limits.maxTokens) {
      throw new Error(`Exceeded max tokens ${usedTokens}/${limits.maxTokens}`);
    }
  }

  protected override postprocess(
    input: ChatModelInput,
    output: ChatModelOutput,
    context: Context,
  ): void {
    super.postprocess(input, output, context);
    const { usage } = output;
    if (usage) {
      context.usage.completionTokens += usage.completionTokens;
      context.usage.promptTokens += usage.promptTokens;
    }
  }
}

export interface ChatModelInput extends Message {
  messages: ChatModelInputMessage[];

  responseFormat?: ChatModelInputResponseFormat;

  tools?: ChatModelInputTool[];

  toolChoice?: ChatModelInputToolChoice;

  modelOptions?: ChatModelOptions;
}

export type Role = "system" | "user" | "agent" | "tool";

export interface ChatModelInputMessage {
  role: Role;

  content?: ChatModelInputMessageContent;

  toolCalls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: Message };
  }[];

  toolCallId?: string;

  name?: string;
}

export type ChatModelInputMessageContent = string | (TextContent | ImageUrlContent)[];

export type TextContent = { type: "text"; text: string };

export type ImageUrlContent = { type: "image_url"; url: string };

const chatModelInputMessageSchema = z.object({
  role: z.union([z.literal("system"), z.literal("user"), z.literal("agent"), z.literal("tool")]),
  content: z
    .union([
      z.string(),
      z.array(
        z.union([
          z.object({ type: z.literal("text"), text: z.string() }),
          z.object({ type: z.literal("image_url"), url: z.string() }),
        ]),
      ),
    ])
    .optional(),
  toolCalls: z
    .array(
      z.object({
        id: z.string(),
        type: z.literal("function"),
        function: z.object({
          name: z.string(),
          arguments: z.record(z.unknown()),
        }),
      }),
    )
    .optional(),
  toolCallId: z.string().optional(),
  name: z.string().optional(),
});

export type ChatModelInputResponseFormat =
  | { type: "text" }
  | {
      type: "json_schema";
      jsonSchema: {
        name: string;
        description?: string;
        schema: Record<string, unknown>;
        strict?: boolean;
      };
    };

const chatModelInputResponseFormatSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text") }),
  z.object({
    type: z.literal("json_schema"),
    jsonSchema: z.object({
      name: z.string(),
      description: z.string().optional(),
      schema: z.record(z.unknown()),
      strict: z.boolean().optional(),
    }),
  }),
]);

export interface ChatModelInputTool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: object;
  };
}

const chatModelInputToolSchema = z.object({
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    description: z.string().optional(),
    parameters: z.record(z.unknown()),
  }),
});

export type ChatModelInputToolChoice =
  | "auto"
  | "none"
  | "required"
  | { type: "function"; function: { name: string; description?: string } };

const chatModelInputToolChoiceSchema = z.union([
  z.literal("auto"),
  z.literal("none"),
  z.literal("required"),
  chatModelInputToolSchema,
]);

export interface ChatModelOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  parallelToolCalls?: boolean;
}

const chatModelOptionsSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
  frequencyPenalty: z.number().optional(),
  presencePenalty: z.number().optional(),
  parallelToolCalls: z.boolean().optional().default(true),
});

const chatModelInputSchema: z.ZodType<ChatModelInput> = z.object({
  messages: z.array(chatModelInputMessageSchema),
  responseFormat: chatModelInputResponseFormatSchema.optional(),
  tools: z.array(chatModelInputToolSchema).optional(),
  toolChoice: chatModelInputToolChoiceSchema.optional(),
  modelOptions: chatModelOptionsSchema.optional(),
});

export interface ChatModelOutput extends Message {
  text?: string;
  json?: object;
  toolCalls?: ChatModelOutputToolCall[];
  usage?: ChatModelOutputUsage;
  model?: string;
}

export interface ChatModelOutputToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: Message;
  };
}

const chatModelOutputToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    arguments: z.record(z.unknown()),
  }),
});

export interface ChatModelOutputUsage {
  promptTokens: number;
  completionTokens: number;
}

const chatModelOutputUsageSchema = z.object({
  promptTokens: z.number(),
  completionTokens: z.number(),
});

const chatModelOutputSchema: z.ZodType<ChatModelOutput> = z.object({
  text: z.string().optional(),
  json: z.record(z.unknown()).optional(),
  toolCalls: z.array(chatModelOutputToolCallSchema).optional(),
  usage: chatModelOutputUsageSchema.optional(),
  model: z.string().optional(),
});
