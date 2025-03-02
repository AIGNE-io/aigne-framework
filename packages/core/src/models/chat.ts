import { z } from "zod";
import { Agent, type AgentInput, type AgentOutput } from "../agents/agent";

export abstract class ChatModel extends Agent<ChatInput, ChatOutput> {
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

export interface ChatInput extends AgentInput {
  messages: ChatMessage[];

  responseFormat?:
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

  tools?: ChatInputTool[];

  toolChoice?:
    | "auto"
    | "none"
    | "required"
    | { type: "function"; function: { name: string; description?: string } };

  modelOptions?: LLMModelOptions;
}

export type Role = "system" | "user" | "agent" | "tool";

export interface ChatMessage {
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
}

export interface ChatInputTool {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters: object;
  };
}

export interface LLMModelOptions {
  model?: string;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ChatOutput extends AgentOutput {
  text?: string;
  json?: object;
  toolCalls?: {
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: AgentInput;
    };
  }[];
}
