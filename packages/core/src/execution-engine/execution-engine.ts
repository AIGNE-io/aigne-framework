import EventEmitter from "node:events";
import { isNil } from "lodash-es";
import { type ZodType, z } from "zod";
import { Agent, type FunctionAgentFn, type Message } from "../agents/agent.js";
import { isTransferAgentOutput, transferAgentOutputKey } from "../agents/types.js";
import { UserAgent } from "../agents/user-agent.js";
import { ChatModel } from "../models/chat-model.js";
import { createMessage } from "../prompt/prompt-builder.js";
import { checkArguments } from "../utils/type-utils.js";
import type { Context, Runnable } from "./context.js";
import {
  type MessagePayload,
  MessageQueue,
  type MessageQueueListener,
  type MessageRequest,
  type Unsubscribe,
} from "./message-queue.js";

export interface ExecutionEngineOptions {
  model?: ChatModel;
  tools?: Agent[];
  agents?: Agent[];
}

export class ExecutionEngine extends EventEmitter implements Context {
  constructor(options?: ExecutionEngineOptions) {
    if (options) checkArguments("ExecutionEngine", executionEngineOptionsSchema, options);

    super();
    this.model = options?.model;
    this.tools = options?.tools ?? [];
    if (options?.agents?.length) this.addAgent(...options.agents);

    this.initProcessExitHandler();
  }

  readonly messageQueue = new MessageQueue();

  model?: ChatModel;

  tools: Agent[];

  private agents: Agent[] = [];

  addAgent(...agents: Agent[]) {
    checkArguments("ExecutionEngine.addAgent", executionEngineAddAgentArgsSchema, agents);

    for (const agent of agents) {
      this.agents.push(agent);

      agent.attach(this);
    }
  }

  private createMessageFromInput(message: Message | string): Message {
    return typeof message === "string" ? createMessage(message) : message;
  }

  /**
   * Publish a message to a topic, the engine will call the listeners of the topic
   * @param topic topic name, or an array of topic names
   * @param message message to publish
   * @param from the agent who publish the message, if not provided, it will be treated as a user message
   */
  publish(topic: string | string[], message: Message | string, from?: Agent) {
    checkArguments("ExecutionEngine.publish", executionEnginePublishArgsSchema, {
      topic,
      message,
      from,
    });

    const request: MessageRequest = {
      role: !from || from instanceof UserAgent ? "user" : "agent",
      source: from?.name,
      message: this.createMessageFromInput(message),
    };

    this.messageQueue.publish(topic, request);
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
    options: { returnActiveAgent?: true },
  ): Promise<[O, Runnable]>;
  call<I extends Message, O extends Message>(
    agent: Runnable<I, O>,
    message?: I | string,
    options?: { returnActiveAgent?: boolean },
  ): UserAgent | Promise<O | [O, Runnable]> {
    checkArguments("ExecutionEngine.call", executionEngineCallArgsSchema, {
      agent,
      message,
      options,
    });

    if (isNil(message)) {
      let activeAgent: Runnable = agent;

      return UserAgent.from({
        context: this,
        process: async (input, context) => {
          const [output, agent] = await context.call(activeAgent, input, {
            returnActiveAgent: true,
          });
          activeAgent = agent;
          return output;
        },
      });
    }

    return this._call(agent, this.createMessageFromInput(message)).then((result) =>
      options?.returnActiveAgent ? [result.output, result.agent] : result.output,
    );
  }

  /**
   * Call an agent with a message and return the output and the active agent
   * @param agent Agent to call
   * @param message Message to pass to the agent
   * @returns the output of the agent and the final active agent
   */
  private async _call<I extends Message, O extends Message>(agent: Runnable<I, O>, message: I) {
    const { output, agent: activeAgent } = await this.callAgent(agent, message);

    if (activeAgent instanceof Agent) {
      const publishTopics =
        typeof activeAgent.publishTopic === "function"
          ? await activeAgent.publishTopic(output)
          : activeAgent.publishTopic;

      if (publishTopics?.length) {
        this.publish(publishTopics, output, activeAgent);
      }
    }

    return { output, agent: activeAgent };
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

const executionEngineSubscribeArgsSchema = z.object({
  topic: z.string(),
  listener: z.function(z.tuple([z.any()]), z.any()).optional(),
});

const executionEngineUnsubscribeArgsSchema = z.object({
  topic: z.string(),
  listener: z.function(z.tuple([z.any()]), z.any()),
});
