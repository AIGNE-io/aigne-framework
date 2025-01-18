import type { SubscriptionError } from "@blocklet/ai-kit/api";
import type { ChatCompletionInput } from "@blocklet/ai-kit/api/types/chat";

import type { ExecuteBlock } from "../assistant";
import type { RuntimeOutputVariablesSchema } from "./schema";

export * from "./schema";
export * from "./error";

export enum ExecutionPhase {
  EXECUTE_BLOCK_START = "EXECUTE_BLOCK_START",
  EXECUTE_SELECT_STOP = "EXECUTE_SELECT_STOP",
  EXECUTE_ASSISTANT_START = "EXECUTE_ASSISTANT_START",
  EXECUTE_ASSISTANT_RUNNING = "EXECUTE_BLOCK_RUNNING",
  EXECUTE_ASSISTANT_END = "EXECUTE_ASSISTANT_END",
}

export enum AssistantResponseType {
  ERROR = "ERROR",
  LOG = "LOG",
  INPUT = "INPUT",
  CHUNK = "CHUNK",
  USAGE = "USAGE",
  EXECUTE = "EXECUTE",
  INPUT_PARAMETER = "INPUT_PARAMETER",
}

// RunAssistantInputParameter 用来展示 user 输入
// 其他用来展示 assistant 输出，输出可能有多个 Agent
// RunAssistantExecute 代表 Agent 执行状态
// RunAssistantInput  代表 Agent 的输入
// RunAssistantChunk 代表 Agent 的输出
export type RunAssistantResponse = { messageId: string; sessionId: string } & (
  | RunAssistantChunk
  | RunAssistantUsage
  | RunAssistantError
  | RunAssistantInput
  | RunAssistantLog
  | RunAssistantExecute
  | RunAssistantInputParameter
);

export type RunAssistantInputParameter = {
  type: AssistantResponseType.INPUT_PARAMETER;
  taskId: string;
  assistantId: string;
  delta: {
    content?: string | null;
  };
};

export type RunAssistantInput = {
  type: AssistantResponseType.INPUT;
  taskId: string;
  parentTaskId?: string;
  assistantId: string;
  assistantName?: string;
  inputParameters?: { [key: string]: any };
  apiArgs?: any;
  fnArgs?: any;
  promptMessages?: ChatCompletionInput["messages"];
  modelParameters?: {
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    model?: string;
    n?: number;
    quality?: string;
    style?: string;
    size?: string;
  };
};

export type RunAssistantExecute = {
  type: AssistantResponseType.EXECUTE;
  taskId: string;
  parentTaskId?: string;
  assistantId: string;
  assistantName?: string;
  execution:
    | {
        currentPhase: ExecutionPhase.EXECUTE_BLOCK_START;
        blockId: string;
        blockName?: string;
      }
    | {
        currentPhase: ExecutionPhase.EXECUTE_ASSISTANT_START;
      }
    | {
        currentPhase: ExecutionPhase.EXECUTE_SELECT_STOP;
      }
    | {
        currentPhase: ExecutionPhase.EXECUTE_ASSISTANT_END;
      }
    | {
        currentPhase: ExecutionPhase.EXECUTE_ASSISTANT_RUNNING;
      };
};

export type RunAssistantLog = {
  type: AssistantResponseType.LOG;
  taskId: string;
  assistantId: string;
  log: string;
  timestamp: number;
};

export type RunAssistantChunk = {
  type: AssistantResponseType.CHUNK;
  taskId: string;
  assistantId: string;
  sessionId: string;
  respondAs?: ExecuteBlock["respondAs"];
  delta: {
    content?: string | null;
    images?: { url: string }[];
    object?: RuntimeOutputVariablesSchema | object;
  };
  messageId: string;
};

export type RunAssistantUsage = {
  type: AssistantResponseType.USAGE;
  taskId: string;
  assistantId: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type RunAssistantError = {
  type: AssistantResponseType.ERROR;
  error: { message: string } | SubscriptionError;
};
