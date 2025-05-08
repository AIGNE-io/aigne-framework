import { EventEmitter } from "node:events";
import { z } from "zod";
import type { Message } from "../agents/agent.js";
import { createMessage } from "../prompt/prompt-builder.js";
import { checkArguments, isNil, orArrayToArray } from "../utils/type-utils.js";
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

function isMessagePayload(payload: unknown): payload is Omit<MessagePayload, "context"> {
  return (
    !isNil(payload) &&
    typeof payload === "object" &&
    "role" in payload &&
    typeof payload.role === "string" &&
    ["user", "agent"].includes(payload.role) &&
    "message" in payload &&
    !isNil(payload.message)
  );
}

/**
 * @hidden
 */
export function toMessagePayload(
  payload: Omit<MessagePayload, "context"> | string | Message,
  options?: Partial<Pick<MessagePayload, "role" | "source">>,
): Omit<MessagePayload, "context"> {
  if (isMessagePayload(payload)) {
    return { ...payload, message: createMessage(payload.message), ...options };
  }
  return {
    role: options?.role || "user",
    source: options?.source,
    message: createMessage(payload),
  };
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

  subscribe(topic: string | string[], listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string | string[], listener: MessageQueueListener): Unsubscribe;
  subscribe(
    topic: string | string[],
    listener?: MessageQueueListener,
  ): Unsubscribe | Promise<MessagePayload>;
  subscribe(
    topic: string | string[],
    listener?: MessageQueueListener,
  ): Unsubscribe | Promise<MessagePayload> {
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

  unsubscribe(topic: string | string[], listener: MessageQueueListener) {
    checkArguments("MessageQueue.unsubscribe", unsubscribeArgsSchema, {
      topic,
      listener,
    });

    for (const t of orArrayToArray(topic)) {
      this.events.off(t, listener);
    }
  }
}

function on<T>(
  events: EventEmitter,
  event: string | string[],
  listener: (arg: T, ...args: unknown[]) => void,
): Unsubscribe {
  orArrayToArray(event).map((e) => events.on(e, listener));
  return () => orArrayToArray(event).map((e) => events.off(e, listener));
}

function once<T>(
  events: EventEmitter,
  event: string | string[],
  listener: (arg: T, ...args: unknown[]) => void,
): Unsubscribe {
  orArrayToArray(event).map((e) => events.once(e, listener));
  return () => orArrayToArray(event).map((e) => events.off(e, listener));
}

const subscribeArgsSchema = z.object({
  topic: z.union([z.string(), z.array(z.string())]),
  listener: z.function(z.tuple([z.any()]), z.any()).optional(),
});

const unsubscribeArgsSchema = z.object({
  topic: z.union([z.string(), z.array(z.string())]),
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
