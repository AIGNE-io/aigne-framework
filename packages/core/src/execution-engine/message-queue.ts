import { EventEmitter } from "node:events";
import type { Message } from "../agents/agent.js";
import { orArrayToArray } from "../utils/type-utils.js";
import type { Context } from "./context.js";

export const UserInputTopic = "UserInputTopic";

export const UserOutputTopic = "UserOutputTopic";

export interface MessagePayload {
  role: "user" | "agent";
  source?: string;
  message: Message;

  // Context of the message
  context: Context;
}

export type MessageQueueListener = (message: MessagePayload) => void;

export type MessageRequest = MessagePayload;

export type Unsubscribe = () => void;

export class MessageQueue {
  private events = new EventEmitter();

  publish(topic: string | string[], message: MessageRequest) {
    for (const t of orArrayToArray(topic)) {
      this.events.emit(t, message);
    }
  }

  error(error: Error) {
    this.events.emit("error", error);
  }

  subscribe(topic: string, listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload>;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload> {
    if (!listener) {
      return new Promise((resolve, reject) => {
        const unsubscribe1 = once<MessagePayload>(this.events, topic, (message) => {
          unsubscribe2();
          resolve(message);
        });
        const unsubscribe2 = once(this.events, "error", (error) => {
          unsubscribe1();
          reject(error);
        });
      });
    }

    return on(this.events, topic, listener);
  }

  unsubscribe(topic: string, listener: MessageQueueListener) {
    this.events.off(topic, listener);
  }
}

function on<T>(
  events: EventEmitter,
  event: string,
  listener: (arg: T, ...args: unknown[]) => void,
): Unsubscribe {
  events.on(event, listener);
  return () => events.off(event, listener);
}

function once<T>(
  events: EventEmitter,
  event: string,
  listener: (arg: T, ...args: unknown[]) => void,
): Unsubscribe {
  events.once(event, listener);
  return () => events.off(event, listener);
}
