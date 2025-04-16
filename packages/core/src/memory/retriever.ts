import { Agent, type Message } from "../agents/agent.js";
import type { Memory } from "./memory.js";

export interface MemoryRetrieverInput extends Message {
  k?: string;
  search?: string;
}

export interface MemoryRetrieverOutput extends Message {
  memories: Memory[];
}

export abstract class MemoryRetriever extends Agent<MemoryRetrieverInput, MemoryRetrieverOutput> {}
