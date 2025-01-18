import { Agent } from "./agent";
import type { Context } from "./context";
import { OrderedRecord } from "./utils";

export type Role = "system" | "user" | "assistant" | "tool";

export interface LLMModelInputs {
  messages: LLMModelInputMessage[];

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

  tools?: LLMModelInputTool[];

  toolChoice?:
    | "auto"
    | "none"
    | "required"
    | { type: "function"; function: { name: string; description?: string } };

  modelOptions?: LLMModelOptions;
}

export interface LLMModelInputMessage {
  role: Role;

  // complex content only supported for role === 'user'
  content:
    | string
    | (
        | { type: "text"; text: string }
        | { type: "image_url"; imageUrl: { url: string } }
      )[];

  // for role === 'assistant'
  toolCalls?: {
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }[];

  // for role === 'tool'
  toolCallId?: string;
}

export interface LLMModelInputTool {
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

export interface LLMModelOutputs {
  $text?: string | null;
  toolCalls?: {
    id?: string;
    type?: "function";
    function?: {
      name?: string;
      arguments?: string;
    };
  }[];
}

export abstract class LLMModel extends Agent<LLMModelInputs, LLMModelOutputs> {
  constructor(context?: Context) {
    super(
      {
        id: "llm_model",
        type: "llm_model",
        name: "LLM Model",
        description: "Run a LLM model",
        inputs: OrderedRecord.fromArray([
          { id: "messages", name: "messages", type: "array", required: true },
          { id: "responseFormat", name: "responseFormat", type: "object" },
          { id: "tools", name: "tools", type: "array" },
          { id: "toolChoice", name: "toolChoice", type: "object" },
          { id: "modelOptions", name: "modelOptions", type: "object" },
        ]),
        outputs: OrderedRecord.fromArray([
          { id: "$text", name: "$text", type: "string" },
          { id: "toolCalls", name: "toolCalls", type: "object" },
        ]),
      },
      context,
    );
  }
}

export interface LLMModelConfiguration {
  default?: Partial<LLMModelOptions>;
  override?: Partial<LLMModelOptions>;
}
