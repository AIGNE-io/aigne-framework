import EventEmitter from "node:events";
import { v7 } from "uuid";
import { type ZodType, z } from "zod";
import { Agent, type FunctionAgentFn, type Message } from "../agents/agent.js";
import { isTransferAgentOutput, transferAgentOutputKey } from "../agents/types.js";
import { UserAgent } from "../agents/user-agent.js";
import type { ChatModel } from "../models/chat-model.js";
import { createMessage } from "../prompt/prompt-builder.js";
import {
  type OmitPropertiesFromArrayFirstElement,
  checkArguments,
  isNil,
} from "../utils/type-utils.js";
import type { Args, Listener, TypedEventEmitter } from "../utils/typed-event-emtter.js";
import {
  type MessagePayload,
  MessageQueue,
  type MessageQueueListener,
  type Unsubscribe,
} from "./message-queue.js";
import { type ContextLimits, type ContextUsage, newEmptyContextUsage } from "./usage.js";

export type Runnable<I extends Message = Message, O extends Message = Message> =
  | Agent<I, O>
  | FunctionAgentFn;

export interface AgentEvent {
  parentContextId?: string;
  contextId: string;
  agent: Agent;
}

export interface ContextEventMap {
  agentStarted: [AgentEvent & { input: Message }];
  agentSucceed: [AgentEvent & { output: Message }];
  agentFailed: [AgentEvent & { error: Error }];
  error: [Error];
}

export type ContextEmitEventMap = {
  [K in keyof ContextEventMap]: OmitPropertiesFromArrayFirstElement<
    ContextEventMap[K],
    "contextId" | "parentContextId"
  >;
};

export interface CallOptions {
  returnActiveAgent?: boolean;
  disableTransfer?: boolean;
}

export interface Context extends TypedEventEmitter<ContextEventMap, ContextEmitEventMap> {
  model?: ChatModel;

  tools?: Agent[];

  usage: ContextUsage;

  limits?: ContextLimits;

  status?: "normal" | "timeout";

  /**
   * Create a user agent to consistently call an agent
   * @param agent Agent to call
   * @returns User agent
   */
  call<I extends Message, O extends Message>(agent: Runnable<I, O>): UserAgent<I, O>;
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
    options: CallOptions & { returnActiveAgent: true },
  ): Promise<[O, Runnable]>;
  /**
   * Call an agent with a message
   * @param agent Agent to call
   * @param message Message to pass to the agent
   * @returns the output of the agent
   */
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message: I | string,
    options?: CallOptions,
  ): Promise<O>;
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message?: I | string,
    options?: CallOptions,
  ): UserAgent<I, O> | Promise<O | [O, Runnable]>;

  /**
   * Publish a message to a topic, the engine will call the listeners of the topic
   * @param topic topic name, or an array of topic names
   * @param payload message to publish
   */
  publish(topic: string | string[], payload: Omit<MessagePayload, "context">): void;

  subscribe(topic: string, listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload>;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload>;

  unsubscribe(topic: string, listener: MessageQueueListener): void;

  /**
   * Create a child context with the same configuration as the parent context.
   * If `reset` is true, the child context will have a new state (such as: usage).
   *
   * @param options
   * @param options.reset create a new context with initial state (such as: usage)
   * @returns new context
   */
  newContext(options?: { reset?: boolean }): Context;
}

export function createPublishMessage(
  message: string | Message,
  from?: Agent,
): Omit<MessagePayload, "context"> {
  return {
    role: !from || from instanceof UserAgent ? "user" : "agent",
    source: from?.name,
    message: createMessage(message),
  };
}

export class ExecutionContext implements Context {
  constructor(parent?: ConstructorParameters<typeof ExecutionContextInternal>[0]) {
    if (parent instanceof ExecutionContext) {
      this.parentId = parent.id;
      this.internal = parent.internal;
    } else {
      this.internal = new ExecutionContextInternal(parent);
    }
  }

  parentId?: string;

  id = v7();

  readonly internal: ExecutionContextInternal;

  get model() {
    return this.internal.model;
  }

  get tools() {
    return this.internal.tools;
  }

  get limits() {
    return this.internal.limits;
  }

  get status() {
    return this.internal.status;
  }

  get usage() {
    return this.internal.usage;
  }

  newContext({ reset }: { reset?: boolean } = {}) {
    if (reset) return new ExecutionContext(this.internal);
    return new ExecutionContext(this);
  }

  call = ((agent, message, options) => {
    checkArguments("ExecutionContext.call", executionContextCallArgsSchema, {
      agent,
      message,
      options,
    });

    if (isNil(message)) {
      return UserAgent.from({
        context: this,
        activeAgent: agent,
      });
    }

    const newContext = this.newContext();
    const msg = createMessage(message);

    return newContext.internal
      .call(agent, msg, newContext, options)
      .then(async ({ output, agent: activeAgent }) => {
        if (activeAgent instanceof Agent) {
          const publishTopics =
            typeof activeAgent.publishTopic === "function"
              ? await activeAgent.publishTopic(output)
              : activeAgent.publishTopic;

          if (publishTopics?.length) {
            newContext.publish(publishTopics, createPublishMessage(output, activeAgent));
          }
        }

        if (options?.returnActiveAgent) {
          return [output, activeAgent];
        }

        return output;
      });
  }) as Context["call"];

  publish = ((topic, payload) => {
    return this.internal.messageQueue.publish(topic, { ...payload, context: this });
  }) as Context["publish"];

  subscribe = ((...args: Parameters<Context["subscribe"]>) => {
    return this.internal.messageQueue.subscribe(...args);
  }) as Context["subscribe"];

  unsubscribe = ((...args: Parameters<Context["unsubscribe"]>) => {
    return this.internal.messageQueue.unsubscribe(...args);
  }) as Context["unsubscribe"];

  emit<K extends keyof ContextEmitEventMap>(
    eventName: K,
    ...args: Args<K, ContextEmitEventMap>
  ): boolean {
    const newArgs = [
      { ...args[0], contextId: this.id, parentContextId: this.parentId },
      ...args.slice(1),
    ] as Args<K, ContextEventMap>;
    return this.internal.events.emit(eventName, ...newArgs);
  }

  on<K extends keyof ContextEventMap>(eventName: K, listener: Listener<K, ContextEventMap>): this {
    this.internal.events.on(eventName, listener);
    return this;
  }

  once<K extends keyof ContextEventMap>(
    eventName: K,
    listener: Listener<K, ContextEventMap>,
  ): this {
    this.internal.events.once(eventName, listener);
    return this;
  }

  off<K extends keyof ContextEventMap>(eventName: K, listener: Listener<K, ContextEventMap>): this {
    this.internal.events.off(eventName, listener);
    return this;
  }
}

class ExecutionContextInternal {
  constructor(
    private readonly parent?: Pick<Context, "model" | "tools" | "limits"> & {
      messageQueue?: MessageQueue;
    },
  ) {
    this.messageQueue = this.parent?.messageQueue ?? new MessageQueue();
  }

  readonly messageQueue: MessageQueue;

  readonly events = new EventEmitter<ContextEventMap>();

  get model() {
    return this.parent?.model;
  }

  get tools() {
    return this.parent?.tools;
  }

  get limits() {
    return this.parent?.limits;
  }

  usage: ContextUsage = newEmptyContextUsage();

  private abortController = new AbortController();

  private timer?: Timer;

  private initTimeout() {
    if (this.timer) return;

    const timeout = this.limits?.timeout;
    if (timeout) {
      this.timer = setTimeout(() => {
        this.abortController.abort();
      }, timeout);
    }
  }

  get status() {
    return this.abortController.signal.aborted ? "timeout" : "normal";
  }

  async call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    input: I,
    context: Context,
    options?: CallOptions,
  ): Promise<{ agent: Runnable; output: O }> {
    this.initTimeout();

    return withAbortSignal(
      this.abortController.signal,
      new Error("ExecutionContext is timeout"),
      () => this.callAgent(agent, input, context, options),
    );
  }

  private async callAgent<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    input: I,
    context: Context,
    options?: CallOptions,
  ): Promise<{ agent: Runnable; output: O }> {
    let activeAgent: Runnable = agent;
    let output: O | undefined;

    for (;;) {
      let result: Message | Agent;

      if (typeof activeAgent === "function") {
        result = await activeAgent(input, context);
      } else {
        result = await activeAgent.call(input, context);
      }

      if (result instanceof Agent) {
        activeAgent = result;
        continue;
      }

      if (!options?.disableTransfer) {
        const transferToAgent = isTransferAgentOutput(result)
          ? result[transferAgentOutputKey].agent
          : undefined;

        if (transferToAgent) {
          activeAgent = transferToAgent;
          continue;
        }
      }

      output = result as O;

      break;
    }

    if (!output) throw new Error("Unexpected empty output");

    return {
      agent: activeAgent,
      output,
    };
  }
}

function withAbortSignal<T>(signal: AbortSignal, error: Error, fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const listener = () => reject(error);

    signal.addEventListener("abort", listener);

    fn()
      .then(resolve, reject)
      .finally(() => {
        signal.removeEventListener("abort", listener);
      });
  });
}

const executionContextCallArgsSchema = z.object({
  agent: z.union([z.function() as ZodType<FunctionAgentFn>, z.instanceof(Agent)]),
  message: z.union([z.record(z.unknown()), z.string()]).optional(),
  options: z.object({ returnActiveAgent: z.boolean().optional() }).optional(),
});
