import { Agent, type Message } from "../agents/agent.js";
import type { Memory } from "./memory.js";

export interface MemoryRecorderInput extends Message {
  messages: Memory[];
}

export interface MemoryRecorderOutput extends Message {
  memories: Memory[];
}

export abstract class MemoryRecorder extends Agent<MemoryRecorderInput, MemoryRecorderOutput> {}
