import type { AIGNEObserver } from "@aigne/observability";
import equal from "fast-deep-equal";
import { Emitter } from "strict-event-emitter";
import { v7 } from "uuid";
import { type ZodType, z } from "zod";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentProcessAsyncGenerator,
  type AgentResponse,
  type AgentResponseChunk,
  type AgentResponseStream,
  type FunctionAgentFn,
  type Message,
  isAgentResponseDelta,
  isEmptyChunk,
} from "../agents/agent.js";
import type { ChatModel } from "../agents/chat-model.js";
import {
  type TransferAgentOutput,
  isTransferAgentOutput,
  transferAgentOutputKey,
} from "../agents/types.js";
import { UserAgent } from "../agents/user-agent.js";
import type { Memory } from "../memory/memory.js";
import { AgentResponseProgressStream } from "../utils/event-stream.js";
import { promiseWithResolvers } from "../utils/promise.js";
import {
  agentResponseStreamToObject,
  asyncGeneratorToReadableStream,
  mergeReadableStreams,
  onAgentResponseStreamEnd,
} from "../utils/stream-utils.js";
import {
  type OmitPropertiesFromArrayFirstElement,
  checkArguments,
  isEmpty,
  isNil,
  omit,
} from "../utils/type-utils.js";
import type { Args, Listener, TypedEventEmitter } from "../utils/typed-event-emtter.js";
import { NO_PARENT_ID, USE_SELF_AS_ROOT_ID } from "./constants.js";
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
    "internalId" | "contextId" | "parentContextId" | "timestamp"
  >;
};

/**
 * @hidden
 */
export interface InvokeOptions<U extends UserContext = UserContext>
  extends Partial<Omit<AgentInvokeOptions<U>, "context">> {
  returnActiveAgent?: boolean;
  returnProgressChunks?: boolean;
  returnMetadata?: boolean;
  disableTransfer?: boolean;
  sourceAgent?: Agent;
  parentId?: string;
  rootId?: string;
}

/**
 * @hidden
 */
export interface UserContext extends Record<string, unknown> {}

/**
 * @hidden
 */
export interface Context<U extends UserContext = UserContext>
  extends TypedEventEmitter<ContextEventMap, ContextEmitEventMap> {
  id: string;

  parentId?: string;

  model?: ChatModel;

  skills?: Agent[];

  observer?: AIGNEObserver;

  usage: ContextUsage;

  limits?: ContextLimits;

  status?: "normal" | "timeout";

  rootId: string;

  userContext: U;

  memories: Pick<Memory, "content">[];

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
    message: I,
    options: InvokeOptions & { returnActiveAgent: true; streaming?: false },
  ): Promise<[O, Agent]>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I,
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
    message: I,
    options?: InvokeOptions & { streaming?: false },
  ): Promise<O>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I,
    options: InvokeOptions & { streaming: true },
  ): Promise<AgentResponseStream<O>>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message?: I,
    options?: InvokeOptions,
  ): UserAgent<I, O> | Promise<AgentResponse<O> | [AgentResponse<O>, Agent]>;

  /**
   * Publish a message to a topic, the aigne will invoke the listeners of the topic
   * @param topic topic name, or an array of topic names
   * @param payload message to publish
   */
  publish(
    topic: string | string[],
    payload: Omit<MessagePayload, "context"> | Message,
    options?: InvokeOptions,
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
  newContext(options?: { reset?: boolean; parentId?: string; rootId?: string }): Context;
}

/**
 * @hidden
 */
export class AIGNEContext implements Context {
  constructor(...[parent, options, ...args]: ConstructorParameters<typeof AIGNEContextShared>) {
    if (parent instanceof AIGNEContext) {
      this.parentId =
        options?.parentId === NO_PARENT_ID ? undefined : (options?.parentId ?? parent.id);
      this.rootId =
        options?.rootId === USE_SELF_AS_ROOT_ID
          ? this.id
          : (options?.rootId ?? parent.rootId ?? this.id);
      this.internal = parent.internal;
    } else {
      this.internal = new AIGNEContextShared(parent, options, ...args);
    }
  }

  traceId?: string;

  id = v7();

  parentId?: string;

  rootId: string = this.id;

  readonly internal: AIGNEContextShared;

  get model() {
    return this.internal.model;
  }

  get skills() {
    return this.internal.skills;
  }

  get observer() {
    return this.internal.observer;
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

  get userContext() {
    return this.internal.userContext;
  }
  set userContext(userContext: Context["userContext"]) {
    this.internal.userContext = userContext;
  }

  get memories() {
    return this.internal.memories;
  }
  set memories(memories: Context["memories"]) {
    this.internal.memories = memories;
  }

  newContext({
    reset,
    parentId,
    rootId,
  }: { reset?: boolean; parentId?: string; rootId?: string } = {}) {
    if (reset) return new AIGNEContext(this, { userContext: {}, parentId, rootId });
    return new AIGNEContext(this, { parentId, rootId });
  }

  invoke = (async (agent, message, options) => {
    checkArguments("AIGNEContext.invoke", aigneContextInvokeArgsSchema, {
      agent,
      message,
      options,
    });
    if (options?.userContext) {
      Object.assign(this.userContext, options.userContext);
      options.userContext = undefined;
    }
    if (options?.memories?.length) {
      this.memories.push(...options.memories);
      options.memories = undefined;
    }

    if (isNil(message)) {
      return UserAgent.from({
        context: this,
        activeAgent: agent,
      });
    }

    const newContext = this.newContext();

    return Promise.resolve(newContext.internal.invoke(agent, message, newContext, options)).then(
      async (response) => {
        if (!options?.streaming) {
          let { __activeAgent__: activeAgent, ...output } =
            await agentResponseStreamToObject(response);
          output = await this.onInvocationResult(output, options);

          if (options?.returnActiveAgent) {
            return [output, activeAgent];
          }

          return output;
        }

        const activeAgentPromise = promiseWithResolvers<Agent>();

        const stream = onAgentResponseStreamEnd(asyncGeneratorToReadableStream(response), {
          onChunk(chunk) {
            if (isAgentResponseDelta(chunk) && chunk.delta.json) {
              return {
                ...chunk,
                delta: {
                  ...chunk.delta,
                  json: omit(chunk.delta.json, "__activeAgent__") as Exclude<
                    typeof chunk.delta.json,
                    TransferAgentOutput
                  >,
                },
              };
            }
          },
          onResult: async (output) => {
            activeAgentPromise.resolve(output.__activeAgent__);
            return await this.onInvocationResult(output, options);
          },
        });

        const finalStream = !options.returnProgressChunks
          ? stream
          : mergeReadableStreams(stream, new AgentResponseProgressStream(newContext));

        if (options.returnActiveAgent) {
          return [finalStream, activeAgentPromise.promise];
        }

        return finalStream;
      },
    );
  }) as Context["invoke"];

  private async onInvocationResult<O extends Message>(
    output: O,
    options?: InvokeOptions,
  ): Promise<O> {
    if (!options?.returnMetadata) {
      return output;
    }

    return {
      ...output,
      $meta: {
        ...output.$meta,
        usage: this.usage,
      },
    };
  }

  publish = ((topic, payload, options) => {
    if (options?.userContext) {
      Object.assign(this.userContext, options.userContext);
      options.userContext = undefined;
    }
    if (options?.memories?.length) {
      this.memories.push(...options.memories);
      options.memories = undefined;
    }

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

    this.trace(eventName, args, b);
    return this.internal.events.emit(eventName, ...newArgs);
  }

  private async trace<K extends keyof ContextEmitEventMap>(
    eventName: K,
    args: Args<K, ContextEmitEventMap>,
    b: AgentEvent,
  ): Promise<void> {
    const observer = this.internal.observer;
    if (!observer) return;

    try {
      switch (eventName) {
        case "agentStarted": {
          const { agent, input } = args[0] as ContextEventMap["agentStarted"][0];
          const res = await observer.record({
            name: agent.name,
            id: this.id,
            rootId: this.rootId,
            parentId: this.parentId,
            startedAt: b.timestamp,
            input,
          });
          this.traceId = res?.id;
          break;
        }
        case "agentSucceed": {
          if (!this.traceId) return;
          const { output } = args[0] as ContextEventMap["agentSucceed"][0];
          observer.update({ id: this.traceId, status: "succeed", endedAt: b.timestamp, output });
          break;
        }
        case "agentFailed": {
          if (!this.traceId) return;
          const { error } = args[0] as ContextEventMap["agentFailed"][0];
          observer.update({
            id: this.traceId,
            status: "failed",
            endedAt: b.timestamp,
            error: { name: error.name, message: error.message, stack: error.stack },
          });
          break;
        }
      }
    } catch (err) {
      console.error("AIGNEContext.trace observer error", {
        eventName,
        error: err,
      });
    }
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

class AIGNEContextShared {
  constructor(
    private readonly parent?: Pick<Context, "model" | "skills" | "limits" | "observer"> & {
      messageQueue?: MessageQueue;
    },
    overrides?: Partial<Context>,
  ) {
    this.messageQueue = this.parent?.messageQueue ?? new MessageQueue();
    this.userContext = overrides?.userContext ?? {};
    this.memories = overrides?.memories ?? [];
  }

  readonly messageQueue: MessageQueue;

  readonly events = new Emitter<any>();

  get model() {
    return this.parent?.model;
  }

  get skills() {
    return this.parent?.skills;
  }

  get observer() {
    return this.parent?.observer;
  }

  get limits() {
    return this.parent?.limits;
  }

  usage: ContextUsage = newEmptyContextUsage();

  userContext: Context["userContext"];

  memories: Context["memories"];

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
    const startedAt = Date.now();
    try {
      let activeAgent: Agent = agent;

      for (;;) {
        const result: Message = {};

        if (options?.sourceAgent && activeAgent !== options.sourceAgent) {
          options.sourceAgent.hooks.onHandoff?.({
            context,
            source: options.sourceAgent,
            target: activeAgent,
            input,
          });
        }

        const stream = await activeAgent.invoke(input, { ...options, context, streaming: true });
        for await (const value of stream) {
          if (isAgentResponseDelta(value)) {
            if (value.delta.json) {
              value.delta.json = omitExistsProperties(result, value.delta.json);
              Object.assign(result, value.delta.json);
            }

            delete value.delta.json?.[transferAgentOutputKey];
          }

          if (isEmptyChunk(value)) continue;

          yield value as AgentResponseChunk<O & { __activeAgent__: Agent }>;
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
        break;
      }

      yield {
        delta: {
          json: { __activeAgent__: activeAgent } as Partial<O & { __activeAgent__: Agent }>,
        },
      };
    } finally {
      const endedAt = Date.now();
      const duration = endedAt - startedAt;
      this.usage.duration += duration;
    }
  }
}

function omitExistsProperties(result: Message, { ...delta }: Message) {
  for (const [key, val] of Object.entries(delta)) {
    if (equal(result[key], val)) delete delta[key];
  }
  return isEmpty(delta) ? undefined : delta;
}

async function* withAbortSignal<T extends Message>(
  signal: AbortSignal,
  error: Error,
  fn: () => AgentProcessAsyncGenerator<T>,
): AgentProcessAsyncGenerator<T> {
  const iterator = fn();

  const timeoutPromise = promiseWithResolvers<never>();

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
