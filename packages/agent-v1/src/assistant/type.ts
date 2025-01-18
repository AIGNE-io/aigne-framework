import type {
  ChatCompletionInput,
  ChatCompletionResponse,
} from "@blocklet/ai-kit/api/types/chat";
import type { ImageGenerationInput } from "@blocklet/ai-kit/api/types/image";

import type {
  Assistant,
  BlockletAgent,
  OnTaskCompletion,
  ProjectSettings,
  RunAssistantResponse,
} from "../types";
import type { Agent } from "../types/runtime/agent";

type OmitBetterStrict<T, K extends keyof T> = T extends any
  ? Pick<T, Exclude<keyof T, K>>
  : never;

export type RunAssistantCallback = (
  e: OmitBetterStrict<RunAssistantResponse, "messageId" | "sessionId">,
) => void;

export class ToolCompletionDirective extends Error {
  type: OnTaskCompletion;

  constructor(message: string, type: OnTaskCompletion) {
    super(message);
    this.type = type;
  }
}

export interface GetAgentOptions {
  aid: string;
  working?: boolean;
  rejectOnEmpty?: boolean | Error;
}

export type GetAgentResult =
  | (Assistant & {
      identity: Agent["identity"];
      project: ProjectSettings;
    })
  | (BlockletAgent & {
      identity?: undefined;
      project?: undefined;
    });

export interface GetAgent {
  (
    options: GetAgentOptions & { rejectOnEmpty: true | Error },
  ): Promise<GetAgentResult>;
  (
    options: GetAgentOptions & { rejectOnEmpty?: false },
  ): Promise<GetAgentResult | null | undefined>;
}

export type Options = {
  assistant: Assistant & { project: { id: string } };
  input: ChatCompletionInput;
};

export type ImageOptions = {
  assistant: Assistant;
  input: ImageGenerationInput;
};

export type ModelInfo = {
  model: string;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
};

export type CallAI = (
  options: Options,
) => Promise<ReadableStream<ChatCompletionResponse>>;

export type CallAIImage = (
  options: ImageOptions,
) => Promise<{ data: { url: string }[] }>;
