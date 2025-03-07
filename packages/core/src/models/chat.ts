import { z } from "zod";
import { Agent, type AgentInput, type AgentOutput } from "../agents/agent";

export abstract class ChatModel extends Agent<ChatModelInput, ChatModelOutput> {
  constructor() {
    super({
      inputSchema: z.object({
        messages: z.array(z.any()),
        responseFormat: z.any().optional(),
        tools: z.array(z.any()).optional(),
        toolChoice: z
          .union([
            z.literal("auto"),
            z.literal("none"),
            z.literal("required"),
            z.object({
              type: z.literal("function"),
              function: z.object({
                name: z.string(),
                description: z.string().optional(),
              }),
            }),
          ])
          .optional(),
        modelOptions: z
          .object({
            model: z.string().optional(),
            temperature: z.number().optional(),
            topP: z.number().optional(),
            frequencyPenalty: z.number().optional(),
            presencePenalty: z.number().optional(),
          })
          .optional(),
      }),
      outputSchema: z.object({
        text: z.string().optional(),
        json: z.any().optional(),
        toolCalls: z
          .array(
            z.object({
              id: z.string(),
              type: z.literal("function"),
              function: z.object({
                name: z.string(),
                arguments: z.any(),
              }),
            }),
          )
          .optional(),
      }),
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

  content?:
    | string
    | ({ type: "text"; text: string } | { type: "image_url"; url: string })[];

  toolCalls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: AgentInput };
  }[];

  toolCallId?: string;

  name?: string;
}

export type ChatModelInputResponseFormat =
  | { type: "text" }
  | {
      type: "json_schema";
      jsonSchema: {
        name: string;
        description?: string;
        schema: object;
        strict?: boolean;
      };
    };

export interface ChatModelInputTool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: object;
  };
}

export type ChatModelInputToolChoice =
  | "auto"
  | "none"
  | "required"
  | { type: "function"; function: { name: string; description?: string } };

export interface ChatModelOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

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
