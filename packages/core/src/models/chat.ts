import { z } from "zod";
import { Agent, type AgentInput, type AgentOutput } from "../agents/agent.js";

export abstract class ChatModel extends Agent<ChatModelInput, ChatModelOutput> {
  constructor() {
    super({
      inputSchema: chatModelInputSchema,
      outputSchema: chatModelOutputSchema,
    });
  }
}

export interface ChatModelInput extends AgentInput {
  messages: ChatModelInputMessage[];

  responseFormat?: ChatModelInputResponseFormat;

  tools?: ChatModelInputTool[];

  toolChoice?: ChatModelInputToolChoice;

  modelOptions?: ChatModelOptions;
}

export type Role = "system" | "user" | "agent" | "tool";

export interface ChatModelInputMessage {
  role: Role;

  content?: string | ({ type: "text"; text: string } | { type: "image_url"; url: string })[];

  toolCalls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: AgentInput };
  }[];

  toolCallId?: string;

  name?: string;
}

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

const chatModelInputResponseFormatSchema = z.union([
  z.literal("text"),
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
}

const chatModelOptionsSchema = z.object({
  model: z.string().optional(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
  frequencyPenalty: z.number().optional(),
  presencePenalty: z.number().optional(),
});

const chatModelInputSchema = z.object({
  messages: z.array(chatModelInputMessageSchema),
  responseFormat: chatModelInputResponseFormatSchema.optional(),
  tools: z.array(chatModelInputToolSchema).optional(),
  toolChoice: chatModelInputToolChoiceSchema.optional(),
  modelOptions: chatModelOptionsSchema.optional(),
});

export interface ChatModelOutput extends AgentOutput {
  text?: string;
  json?: object;
  toolCalls?: ChatModelOutputToolCall[];
}

export interface ChatModelOutputToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: AgentInput;
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

const chatModelOutputSchema = z.object({
  text: z.string().optional(),
  json: z.unknown().optional(),
  toolCalls: z.array(chatModelOutputToolCallSchema).optional(),
});
