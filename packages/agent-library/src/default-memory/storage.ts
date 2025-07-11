import type { AgentInvokeOptions, Memory } from "@aigne/core";

export abstract class MemoryStorage {
  abstract create(
    memory: Pick<Memory, "content">,
    options: AgentInvokeOptions,
  ): Promise<{ result: Memory }>;

  abstract search(
    query: { search?: string; limit?: number; orderBy?: [string, "asc" | "desc"] },
    options: AgentInvokeOptions,
  ): Promise<{ result: Memory[] }>;
}
