import EventEmitter from "node:events";
import { z } from "zod";
import { Agent, type Message } from "../agents/agent.js";
import {} from "../agents/types.js";
import type { UserAgent } from "../agents/user-agent.js";
import { load } from "../loader/index.js";
import { ChatModel } from "../models/chat-model.js";
import { checkArguments, createAccessorArray } from "../utils/type-utils.js";
import { type ContextLimits, ExecutionContext, type Runnable } from "./context.js";
import {
  type MessagePayload,
  MessageQueue,
  type MessageQueueListener,
  type Unsubscribe,
} from "./message-queue.js";

export interface ExecutionEngineOptions {
  name?: string;
  description?: string;
  model?: ChatModel;
  tools?: Agent[];
  agents?: Agent[];
  limits?: ContextLimits;
}

export class ExecutionEngine extends EventEmitter {
  static async load({
    path,
    ...options
  }: { path: string } & ExecutionEngineOptions): Promise<ExecutionEngine> {
    const { model, agents, tools, ...aigne } = await load({ path });
    return new ExecutionEngine({
      model,
      ...options,
      name: options.name || aigne.name || undefined,
      description: options.description || aigne.description || undefined,
      agents: agents.concat(options.agents ?? []),
      tools: tools.concat(options.tools ?? []),
    });
  }

  constructor(options?: ExecutionEngineOptions) {
    if (options) checkArguments("ExecutionEngine", executionEngineOptionsSchema, options);

    super();
    this.name = options?.name;
    this.description = options?.description;
    this.model = options?.model;
    this.limits = options?.limits;
    if (options?.tools?.length) this.tools.push(...options.tools);
    if (options?.agents?.length) this.addAgent(...options.agents);

    this.initProcessExitHandler();
  }

  name?: string;

  description?: string;

  readonly messageQueue = new MessageQueue();

  model?: ChatModel;

  readonly tools = createAccessorArray<Agent>([], (arr, name) => arr.find((i) => i.name === name));

  readonly agents = createAccessorArray<Agent>([], (arr, name) => arr.find((i) => i.name === name));

  limits?: ContextLimits;

  addAgent(...agents: Agent[]) {
    checkArguments("ExecutionEngine.addAgent", executionEngineAddAgentArgsSchema, agents);

    for (const agent of agents) {
      this.agents.push(agent);

      agent.attach(this);
    }
  }

  newContext() {
    return new ExecutionContext(this);
  }

  /**
   * Publish a message to a topic, the engine will call the listeners of the topic
   * @param topic topic name, or an array of topic names
   * @param message message to publish
   * @param from the agent who publish the message, if not provided, it will be treated as a user message
   */
  publish(topic: string | string[], message: Message | string, from?: Agent) {
    return new ExecutionContext(this).publish(topic, message, from);
  }

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
    message?: I | string,
    options?: { returnActiveAgent?: boolean },
  ): UserAgent<I, O> | Promise<O | [O, Runnable]>;
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message?: I | string,
    options?: { returnActiveAgent?: boolean },
  ): UserAgent<I, O> | Promise<O | [O, Runnable]> {
    return new ExecutionContext(this).call(agent, message, options);
  }

  subscribe(topic: string, listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload>;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload> {
    checkArguments("ExecutionEngine.subscribe", executionEngineSubscribeArgsSchema, {
      topic,
      listener,
    });

    return this.messageQueue.subscribe(topic, listener);
  }

  unsubscribe(topic: string, listener: MessageQueueListener) {
    checkArguments("ExecutionEngine.unsubscribe", executionEngineUnsubscribeArgsSchema, {
      topic,
      listener,
    });

    this.messageQueue.unsubscribe(topic, listener);
  }

  async shutdown() {
    for (const tool of this.tools) {
      await tool.shutdown();
    }
    for (const agent of this.agents) {
      await agent.shutdown();
    }
  }

  private initProcessExitHandler() {
    const shutdownAndExit = () => this.shutdown().finally(() => process.exit(0));
    process.on("SIGINT", shutdownAndExit);
    process.on("exit", shutdownAndExit);
  }
}

const executionEngineOptionsSchema = z.object({
  model: z.instanceof(ChatModel).optional(),
  tools: z.array(z.instanceof(Agent)).optional(),
  agents: z.array(z.instanceof(Agent)).optional(),
});

const executionEngineAddAgentArgsSchema = z.array(z.instanceof(Agent));

const executionEngineSubscribeArgsSchema = z.object({
  topic: z.string(),
  listener: z.function(z.tuple([z.any()]), z.any()).optional(),
});

const executionEngineUnsubscribeArgsSchema = z.object({
  topic: z.string(),
  listener: z.function(z.tuple([z.any()]), z.any()),
});
