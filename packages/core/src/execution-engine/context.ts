import type EventEmitter from "node:events";
import type { Agent, FunctionAgentFn, Message } from "../agents/agent.js";
import type { ChatModel } from "../models/chat.js";
import type { MessagePayload, MessageQueueListener, Unsubscribe } from "./message-queue.js";

export type Runnable<I extends Message = Message, O extends Message = Message> =
  | Agent<I, O>
  | FunctionAgentFn;

export interface Context extends EventEmitter {
  model?: ChatModel;
  tools?: Agent[];

  /**
   * Call an agent with a message
   * @param agent Agent to call
   * @param message Message to pass to the agent
   * @returns the output of the agent
   */
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message: I | string,
  ): Promise<O>;
  /**
   * Call an agent with a message and return the output and the active agent
   * @param agent Agent to call
   * @param message Message to pass to the agent
   * @param options.returnActiveAgent return the active agent
   * @returns the output of the agent and the final active agent
   */
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message: I | string,
    options: { returnActiveAgent?: true },
  ): Promise<[O, Runnable]>;
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message: I | string,
    options?: { returnActiveAgent?: boolean },
  ): Promise<O | [O, Runnable]>;

  /**
   * Publish a message to a topic, the engine will call the listeners of the topic
   * @param topic topic name, or an array of topic names
   * @param message message to publish
   * @param from the agent who publish the message, if not provided, it will be treated as a user message
   */
  publish(topic: string | string[], message: Message | string, from?: Agent): void;

  subscribe(topic: string, listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload>;

  unsubscribe(topic: string, listener: MessageQueueListener): void;
}
