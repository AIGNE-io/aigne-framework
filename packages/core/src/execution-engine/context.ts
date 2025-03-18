import type EventEmitter from "node:events";
import type { Agent, AgentInput, AgentOutput } from "../agents/agent.js";
import type { ChatModel } from "../models/chat.js";

export interface Context extends EventEmitter {
  model?: ChatModel;
  tools?: Agent[];
  publish(topic: string, message: unknown): void;
  subscribe(topic: string, listener: (message: AgentInput) => void): void;
  unsubscribe(topic: string, listener: (message: AgentOutput) => void): void;
}
