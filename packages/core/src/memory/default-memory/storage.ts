import type { AgentInvokeOptions } from "../../agents/agent.js";
import type { Memory } from "../memory.js";

export abstract class MemoryStorage {
  abstract create(
    memory: Pick<Memory, "content">,
    options: AgentInvokeOptions,
  ): Promise<{ result: Memory }>;

  abstract search(
    query: { search?: string; limit?: number },
    options: AgentInvokeOptions,
  ): Promise<{ result: Memory[] }>;
}
