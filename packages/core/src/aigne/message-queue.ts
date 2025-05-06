import { EventEmitter } from "node:events";
import { z } from "zod";
import type { Message } from "../agents/agent.js";
import { checkArguments, orArrayToArray } from "../utils/type-utils.js";
import type { Context } from "./context.js";

/**
 * @hidden
 */
export const UserInputTopic = "UserInputTopic";

/**
 * @hidden
 */
export const UserOutputTopic = "UserOutputTopic";

/**
 * @hidden
 */
export interface MessagePayload {
  role: "user" | "agent";
  source?: string;
  message: Message;

  // Context of the message
  context: Context;
}

/**
 * @hidden
 */
export type MessageQueueListener = (message: MessagePayload) => void;

/**
 * @hidden
 */
export type Unsubscribe = () => void;

/**
 * @hidden
 */
export class MessageQueue {
  events = new EventEmitter();

  publish(topic: string | string[], payload: MessagePayload) {
    checkArguments("MessageQueue.publish", publishArgsSchema, {
      topic,
      payload,
    });

    for (const t of orArrayToArray(topic)) {
      this.events.emit(t, payload);
    }
  }

  error(error: Error) {
    this.events.emit("error", error);
  }

  subscribe(topic: string, listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload>;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload> {
    checkArguments("MessageQueue.subscribe", subscribeArgsSchema, {
      topic,
      listener,
    });

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
    checkArguments("MessageQueue.unsubscribe", unsubscribeArgsSchema, {
      topic,
      listener,
    });

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

const subscribeArgsSchema = z.object({
  topic: z.string(),
  listener: z.function(z.tuple([z.any()]), z.any()).optional(),
});

const unsubscribeArgsSchema = z.object({
  topic: z.string(),
  listener: z.function(z.tuple([z.any()]), z.any()),
});

const publishArgsSchema = z.object({
  topic: z.union([z.string(), z.array(z.string())]),
  payload: z.object({
    role: z.union([z.literal("user"), z.literal("agent")]),
    source: z.string().optional(),
    message: z.union([z.string(), z.record(z.unknown())]),
    context: z.any(),
  }),
});
