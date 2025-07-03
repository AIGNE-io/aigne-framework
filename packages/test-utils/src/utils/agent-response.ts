import {
  type AgentResponseChunk,
  type AgentResponseStream,
  isAgentResponseProgress,
  type Message,
} from "@aigne/core";
import { readableStreamToArray } from "@aigne/core/utils/stream-utils.js";

export async function agentResponseStreamToArraySnapshot<T extends Message>(
  stream: AgentResponseStream<T>,
  options?: { catchError?: false },
): Promise<AgentResponseChunk<T>[]>;
export async function agentResponseStreamToArraySnapshot<T extends Message>(
  stream: AgentResponseStream<T>,
  options?: { catchError?: boolean },
): Promise<(AgentResponseChunk<T> | Error)[]>;
export async function agentResponseStreamToArraySnapshot<T extends Message>(
  stream: AgentResponseStream<T>,
  options?: { catchError?: boolean },
): Promise<(AgentResponseChunk<T> | Error)[]> {
  return (await readableStreamToArray(stream, options)).map((i) =>
    !(i instanceof Error) && isAgentResponseProgress(i)
      ? {
          progress: {
            ...i.progress,
            contextId: "TEST_CONTEXT_ID",
            parentContextId: "TEST_PARENT_CONTEXT_ID",
            timestamp: 123456,
          },
        }
      : i,
  );
}
