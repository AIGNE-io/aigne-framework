import EventEmitter from "node:events";
import { type ZodType, z } from "zod";
import { Agent, type FunctionAgentFn, type Message } from "../agents/agent.js";
import { isTransferAgentOutput, transferAgentOutputKey } from "../agents/types.js";
import { UserAgent } from "../agents/user-agent.js";
import type { ChatModel } from "../models/chat-model.js";
import { createMessage } from "../prompt/prompt-builder.js";
import { checkArguments, isNil } from "../utils/type-utils.js";
import {
  type MessagePayload,
  MessageQueue,
  type MessageQueueListener,
  type MessageRequest,
  type Unsubscribe,
} from "./message-queue.js";

export type Runnable<I extends Message = Message, O extends Message = Message> =
  | Agent<I, O>
  | FunctionAgentFn;

export interface ContextUsage {
  promptTokens: number;
  completionTokens: number;
  agentCalls: number;
}

export interface ContextLimits {
  maxTokens?: number;
  maxAgentCalls?: number;
  timeout?: number;
}

export interface Context extends EventEmitter {
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
    options: { returnActiveAgent: true },
  ): Promise<[O, Runnable]>;
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message: I | string,
    options?: { returnActiveAgent?: boolean },
  ): UserAgent<I, O> | Promise<O | [O, Runnable]>;

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

export class ExecutionContext extends EventEmitter implements Context {
  constructor(
    private readonly engine?: {
      model?: ChatModel;
      tools?: Agent[];
      limits?: ContextLimits;
      messageQueue?: MessageQueue;
      emit?: EventEmitter["emit"];
    },
  ) {
    super();
    this.limits = engine?.limits;
    this.messageQueue = engine?.messageQueue ?? new MessageQueue();
  }

  private messageQueue: MessageQueue;

  get model() {
    return this.engine?.model;
  }

  get tools() {
    return this.engine?.tools;
  }

  usage: ContextUsage = {
    promptTokens: 0,
    completionTokens: 0,
    agentCalls: 0,
  };

  limits?: ContextLimits | undefined;

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

  call<I extends Message, O extends Message>(agent: Runnable<I, O>): UserAgent<I, O>;
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message: I | string,
  ): Promise<O>;
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message: I | string,
    options: { returnActiveAgent: true },
  ): Promise<[O, Runnable]>;
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message?: I | string,
    options?: { returnActiveAgent?: boolean },
  ): UserAgent<I, O> | Promise<O | [O, Runnable]>;
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message?: I | string,
    options?: { returnActiveAgent?: boolean },
  ): UserAgent<I, O> | Promise<O | [O, Runnable]> {
    checkArguments("ExecutionEngine._call", executionEngineCallArgsSchema, {
      agent,
      message,
      options,
    });

    if (isNil(message)) {
      let activeAgent: Runnable = agent;

      return UserAgent.from<I, O>({
        context: this,
        process: async (input, context) => {
          const [output, agent] = await context.call(activeAgent, input, {
            returnActiveAgent: true,
          });
          activeAgent = agent;
          return output as O;
        },
      });
    }

    return withAbortSignal(
      this.abortController.signal,
      new Error("ExecutionEngine is timeout"),
      async () => {
        this.initTimeout();

        const msg = createMessageFromInput(message);

        return this.callAgent(agent, msg).then(async ({ output, agent: activeAgent }) => {
          if (activeAgent instanceof Agent) {
            const publishTopics =
              typeof activeAgent.publishTopic === "function"
                ? await activeAgent.publishTopic(output)
                : activeAgent.publishTopic;

            if (publishTopics?.length) {
              this.publish(publishTopics, output, activeAgent);
            }
          }

          if (options?.returnActiveAgent) {
            return [output, activeAgent];
          }

          return output;
        });
      },
    );
  }

  publish(topic: string | string[], message: Message | string, from?: Agent): void {
    checkArguments("ExecutionEngineContext.publish", executionEnginePublishArgsSchema, {
      topic,
      message,
      from,
    });

    const request: MessageRequest = {
      role: !from || from instanceof UserAgent ? "user" : "agent",
      source: from?.name,
      message: createMessageFromInput(message),
      context: this,
    };

    this.messageQueue.publish(topic, request);
  }

  subscribe(topic: string, listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload> {
    return this.messageQueue.subscribe(topic, listener);
  }

  unsubscribe(topic: string, listener: MessageQueueListener): void {
    this.messageQueue.unsubscribe(topic, listener);
  }

  emit(eventName: string | symbol, ...args: unknown[]) {
    if (this.engine?.emit) return this.engine.emit(eventName, ...args);
    return super.emit(eventName, ...args);
  }

  private async callAgent<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    input: I,
  ): Promise<{ agent: Runnable; output: O }> {
    let activeAgent: Runnable = agent;
    let output: O | undefined;

    for (;;) {
      let result: Message | Agent;

      if (typeof activeAgent === "function") {
        result = await activeAgent(input, this);
      } else {
        result = await activeAgent.call(input, this);
      }

      if (!(result instanceof Agent)) output = result as O;

      const transferToAgent =
        result instanceof Agent
          ? result
          : isTransferAgentOutput(result)
            ? result[transferAgentOutputKey].agent
            : undefined;

      if (transferToAgent) {
        activeAgent = transferToAgent;
      } else {
        break;
      }
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

function createMessageFromInput(message: Message | string): Message {
  return typeof message === "string" ? createMessage(message) : message;
}

const executionEnginePublishArgsSchema = z.object({
  topic: z.union([z.string(), z.array(z.string())]),
  message: z.union([z.string(), z.record(z.unknown())]),
  from: z.instanceof(Agent).optional(),
});

const executionEngineCallArgsSchema = z.object({
  agent: z.union([z.function() as ZodType<FunctionAgentFn>, z.instanceof(Agent)]),
  message: z.union([z.record(z.unknown()), z.string()]).optional(),
  options: z.object({ returnActiveAgent: z.boolean().optional() }).optional(),
});
