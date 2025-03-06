import type EventEmitter from "node:events";
import type { Agent, AgentInput, AgentOutput } from "../agents/agent";
import type { ChatModel } from "../models/chat";
import type { MessageQueue } from "./message-queue";

export interface Context extends EventEmitter {
  model?: ChatModel;
  tools?: Agent[];
  publish(topic: string, message: unknown): void;
  subscribe(topic: string, listener: (message: AgentInput) => void): void;
  unsubscribe(topic: string, listener: (message: AgentOutput) => void): void;
}
