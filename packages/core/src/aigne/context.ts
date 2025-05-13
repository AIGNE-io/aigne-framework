import EventEmitter from "node:events";
import { v7 } from "uuid";
import { type ZodType, z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentProcessAsyncGenerator,
  type AgentResponse,
  type AgentResponseStream,
  type FunctionAgentFn,
  type Message,
} from "../agents/agent.js";
import { isTransferAgentOutput, transferAgentOutputKey } from "../agents/types.js";
import { UserAgent } from "../agents/user-agent.js";
import type { ChatModel } from "../models/chat-model.js";
import { createMessage } from "../prompt/prompt-builder.js";
import {
  agentResponseStreamToObject,
  asyncGeneratorToReadableStream,
  onAgentResponseStreamEnd,
  readableStreamToAsyncIterator,
} from "../utils/stream-utils.js";
import {
  type OmitPropertiesFromArrayFirstElement,
  checkArguments,
  isNil,
  omitBy,
} from "../utils/type-utils.js";
import type { Args, Listener, TypedEventEmitter } from "../utils/typed-event-emtter.js";
import {
  type MessagePayload,
  MessageQueue,
  type MessageQueueListener,
  type Unsubscribe,
  toMessagePayload,
} from "./message-queue.js";
import { type ContextLimits, type ContextUsage, newEmptyContextUsage } from "./usage.js";

/**
 * @hidden
 */
export interface AgentEvent {
  parentContextId?: string;
  contextId: string;
  timestamp: number;
  agent: Agent;
}

/**
 * @hidden
 */
export interface ContextEventMap {
  agentStarted: [AgentEvent & { input: Message }];
  agentSucceed: [AgentEvent & { output: Message }];
  agentFailed: [AgentEvent & { error: Error }];
}

/**
 * @hidden
 */
export type ContextEmitEventMap = {
  [K in keyof ContextEventMap]: OmitPropertiesFromArrayFirstElement<
    ContextEventMap[K],
    "contextId" | "parentContextId" | "timestamp"
  >;
};

/**
 * @hidden
 */
export interface InvokeOptions extends AgentInvokeOptions {
  returnActiveAgent?: boolean;
  disableTransfer?: boolean;
}

/**
 * @hidden
 */
export interface Context extends TypedEventEmitter<ContextEventMap, ContextEmitEventMap> {
  model?: ChatModel;

  skills?: Agent[];

  usage: ContextUsage;

  limits?: ContextLimits;

  status?: "normal" | "timeout";

  /**
   * Create a user agent to consistently invoke an agent
   * @param agent Agent to invoke
   * @returns User agent
   */
  invoke<I extends Message, O extends Message>(agent: Agent<I, O>): UserAgent<I, O>;
  /**
   * Invoke an agent with a message and return the output and the active agent
   * @param agent Agent to invoke
   * @param message Message to pass to the agent
   * @param options.returnActiveAgent return the active agent
   * @param options.streaming return a stream of the output
   * @returns the output of the agent and the final active agent
   */
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I | string,
    options: InvokeOptions & { returnActiveAgent: true; streaming?: false },
  ): Promise<[O, Agent]>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I | string,
    options: InvokeOptions & { returnActiveAgent: true; streaming: true },
  ): Promise<[AgentResponseStream<O>, Promise<Agent>]>;
  /**
   * Invoke an agent with a message
   * @param agent Agent to invoke
   * @param message Message to pass to the agent
   * @returns the output of the agent
   */
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I | string,
    options?: InvokeOptions & { streaming?: false },
  ): Promise<O>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I | string,
    options: InvokeOptions & { streaming: true },
  ): Promise<AgentResponseStream<O>>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message?: I | string,
    options?: InvokeOptions,
  ): UserAgent<I, O> | Promise<AgentResponse<O> | [AgentResponse<O>, Agent]>;

  /**
   * Publish a message to a topic, the aigne will invoke the listeners of the topic
   * @param topic topic name, or an array of topic names
   * @param payload message to publish
   */
  publish(
    topic: string | string[],
    payload: Omit<MessagePayload, "context"> | Message | string,
  ): void;

  subscribe(topic: string | string[], listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string | string[], listener: MessageQueueListener): Unsubscribe;
  subscribe(
    topic: string | string[],
    listener?: MessageQueueListener,
  ): Unsubscribe | Promise<MessagePayload>;
  subscribe(
    topic: string | string[],
    listener?: MessageQueueListener,
  ): Unsubscribe | Promise<MessagePayload>;

  unsubscribe(topic: string | string[], listener: MessageQueueListener): void;

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

/**
 * @hidden
 */
export class AIGNEContext implements Context {
  constructor(parent?: ConstructorParameters<typeof AIGNEContextInternal>[0]) {
    if (parent instanceof AIGNEContext) {
      this.parentId = parent.id;
      this.internal = parent.internal;
    } else {
      this.internal = new AIGNEContextInternal(parent);
    }
  }

  parentId?: string;

  id = v7();

  readonly internal: AIGNEContextInternal;

  get model() {
    return this.internal.model;
  }

  get skills() {
    return this.internal.skills;
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
    if (reset) return new AIGNEContext(this.internal);
    return new AIGNEContext(this);
  }

  invoke = ((agent, message, options) => {
    checkArguments("AIGNEContext.invoke", aigneContextInvokeArgsSchema, {
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

    return Promise.resolve(newContext.internal.invoke(agent, msg, newContext, options)).then(
      async (response) => {
        if (!options?.streaming) {
          const { __activeAgent__: activeAgent, ...output } =
            await agentResponseStreamToObject(response);

          if (options?.returnActiveAgent) {
            return [output, activeAgent];
          }

          return output;
        }

        const activeAgentPromise = Promise.withResolvers<Agent>();

        const stream = onAgentResponseStreamEnd(
          asyncGeneratorToReadableStream(response),
          async ({ __activeAgent__: activeAgent }) => {
            activeAgentPromise.resolve(activeAgent);
          },
          {
            processChunk(chunk) {
              if (chunk.delta.json) {
                return {
                  ...chunk,
                  delta: {
                    ...chunk.delta,
                    json: omitBy(chunk.delta.json, (_, k) => k === "__activeAgent__"),
                  },
                };
              }
              return chunk;
            },
          },
        );

        if (options.returnActiveAgent) {
          return [stream, activeAgentPromise.promise];
        }

        return stream;
      },
    );
  }) as Context["invoke"];

  publish = ((topic, payload) => {
    return this.internal.messageQueue.publish(topic, {
      ...toMessagePayload(payload),
      context: this,
    });
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
    const b: AgentEvent = {
      ...args[0],
      contextId: this.id,
      parentContextId: this.parentId,
      timestamp: Date.now(),
    };

    const newArgs = [b, ...args.slice(1)] as Args<K, ContextEventMap>;

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

class AIGNEContextInternal {
  constructor(
    private readonly parent?: Pick<Context, "model" | "skills" | "limits"> & {
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

  get skills() {
    return this.parent?.skills;
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

  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    input: I,
    context: Context,
    options?: InvokeOptions,
  ): AgentProcessAsyncGenerator<O & { __activeAgent__: Agent }> {
    this.initTimeout();

    return withAbortSignal(this.abortController.signal, new Error("AIGNEContext is timeout"), () =>
      this.invokeAgent(agent, input, context, options),
    );
  }

  private async *invokeAgent<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    input: I,
    context: Context,
    options?: InvokeOptions,
  ): AgentProcessAsyncGenerator<O & { __activeAgent__: Agent }> {
    let activeAgent: Agent = agent;
    let output: O | undefined;

    for (;;) {
      const result: Message = {};

      const stream = await activeAgent.invoke(input, context, { streaming: true });
      for await (const value of readableStreamToAsyncIterator(stream)) {
        if (value.delta.text) {
          yield { delta: { text: value.delta.text } as Message };
        }
        if (value.delta.json) {
          Object.assign(result, value.delta.json);
        }
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

    yield {
      delta: {
        json: {
          ...output,
          __activeAgent__: activeAgent,
        },
      },
    };
  }
}

async function* withAbortSignal<T extends Message>(
  signal: AbortSignal,
  error: Error,
  fn: () => AgentProcessAsyncGenerator<T>,
): AgentProcessAsyncGenerator<T> {
  const iterator = fn();

  const timeoutPromise = Promise.withResolvers<never>();

  const listener = () => {
    timeoutPromise.reject(error);
  };

  signal.addEventListener("abort", listener);

  try {
    for (;;) {
      const next = await Promise.race([iterator.next(), timeoutPromise.promise]);
      if (next.done) break;
      yield next.value;
    }
  } finally {
    signal.removeEventListener("abort", listener);
  }
}

const aigneContextInvokeArgsSchema = z.object({
  agent: z.union([z.function() as ZodType<FunctionAgentFn>, z.instanceof(Agent)]),
  message: z.union([z.record(z.unknown()), z.string()]).optional(),
  options: z.object({ returnActiveAgent: z.boolean().optional() }).optional(),
});
