import { AIGNEObserver } from "@aigne/observability";
import { z } from "zod";
import {
  Agent,
  type AgentResponse,
  type AgentResponseStream,
  type Message,
} from "../agents/agent.js";
import { ChatModel } from "../agents/chat-model.js";
import type { UserAgent } from "../agents/user-agent.js";
import { type LoadOptions, load } from "../loader/index.js";
import { checkArguments, createAccessorArray } from "../utils/type-utils.js";
import { AIGNEContext, type Context, type InvokeOptions, type UserContext } from "./context.js";
import {
  type MessagePayload,
  MessageQueue,
  type MessageQueueListener,
  type Unsubscribe,
} from "./message-queue.js";
import type { ContextLimits } from "./usage.js";

/**
 * Options for the AIGNE class.
 */
export interface AIGNEOptions {
  /**
   * The name of the AIGNE instance.
   */
  name?: string;

  /**
   * The description of the AIGNE instance.
   */
  description?: string;

  /**
   * Global model to use for all agents not specifying a model.
   */
  model?: ChatModel;

  /**
   * Skills to use for the AIGNE instance.
   */
  skills?: Agent[];

  /**
   * Agents to use for the AIGNE instance.
   */
  agents?: Agent[];

  /**
   * Limits for the AIGNE instance, such as timeout, max tokens, max invocations, etc.
   */
  limits?: ContextLimits;

  /**
   * Observer for the AIGNE instance.
   */
  observer?: AIGNEObserver;
}

/**
 * AIGNE is a class that orchestrates multiple agents to build complex AI applications.
 * It serves as the central coordination point for agent interactions, message passing, and execution flow.
 *
 * @example
 * Here's a simple example of how to use AIGNE:
 * {@includeCode ../../test/aigne/aigne.test.ts#example-simple}
 *
 * @example
 * Here's an example of how to use AIGNE with streaming response:
 * {@includeCode ../../test/aigne/aigne.test.ts#example-streaming}
 */
export class AIGNE<U extends UserContext = UserContext> {
  /**
   * Loads an AIGNE instance from a directory containing an aigne.yaml file and agent definitions.
   * This static method provides a convenient way to initialize an AIGNE system from configuration files.
   *
   * @param path - Path to the directory containing the aigne.yaml file.
   * @param options - Options to override the loaded configuration.
   * @returns A fully initialized AIGNE instance with configured agents and skills.
   */
  static async load(
    path: string,
    options: AIGNEOptions & Omit<LoadOptions, "path">,
  ): Promise<AIGNE> {
    const { model, agents, skills, ...aigne } = await load({ ...options, path });
    return new AIGNE({
      ...options,
      model: options?.model || model,
      name: options?.name || aigne.name || undefined,
      description: options?.description || aigne.description || undefined,
      agents: agents.concat(options?.agents ?? []),
      skills: skills.concat(options?.skills ?? []),
    });
  }

  /**
   * Creates a new AIGNE instance with the specified options.
   *
   * @param options - Configuration options for the AIGNE instance including name, description, model, and agents.
   */
  constructor(options?: AIGNEOptions) {
    if (options) checkArguments("AIGNE", aigneOptionsSchema, options);

    this.name = options?.name;
    this.description = options?.description;
    this.model = options?.model;
    this.limits = options?.limits;
    this.observer =
      process.env.DISABLE_AIGNE_OBSERVABILITY === "true"
        ? undefined
        : (options?.observer ?? new AIGNEObserver());
    if (options?.skills?.length) this.skills.push(...options.skills);
    if (options?.agents?.length) this.addAgent(...options.agents);

    this.initProcessExitHandler();
  }

  /**
   * Optional name identifier for this AIGNE instance.
   */
  name?: string;

  /**
   * Optional description of this AIGNE instance's purpose or functionality.
   */
  description?: string;

  /**
   * Global model to use for all agents that don't specify their own model.
   */
  model?: ChatModel;

  /**
   * Usage limits applied to this AIGNE instance's execution.
   */
  limits?: ContextLimits;

  /**
   * Message queue for handling inter-agent communication.
   *
   * @hidden
   */
  readonly messageQueue = new MessageQueue();

  /**
   * Collection of skill agents available to this AIGNE instance.
   * Provides indexed access by skill name.
   */
  readonly skills = createAccessorArray<Agent>([], (arr, name) => arr.find((i) => i.name === name));

  /**
   * Collection of primary agents managed by this AIGNE instance.
   * Provides indexed access by agent name.
   */
  readonly agents = createAccessorArray<Agent>([], (arr, name) => arr.find((i) => i.name === name));

  /**
   * Observer for the AIGNE instance.
   */
  readonly observer?: AIGNEObserver;

  /**
   * Adds one or more agents to this AIGNE instance.
   * Each agent is attached to this AIGNE instance, allowing it to access the AIGNE's resources.
   *
   * @param agents - One or more Agent instances to add to this AIGNE.
   */
  addAgent(...agents: Agent[]) {
    checkArguments("AIGNE.addAgent", aigneAddAgentArgsSchema, agents);

    for (const agent of agents) {
      this.agents.push(agent);

      agent.attach(this);
    }
  }

  /**
   * Creates a new execution context for this AIGNE instance.
   * Contexts isolate state for different flows or conversations.
   *
   * @returns A new AIGNEContext instance bound to this AIGNE.
   */
  newContext(options?: Partial<Pick<Context, "userContext" | "memories">>) {
    const context = new AIGNEContext(this);

    if (options?.userContext) context.userContext = options.userContext;
    if (options?.memories) context.memories = options.memories;

    return context;
  }

  /**
   * Creates a user agent for consistent interactions with a specified agent.
   * This method allows you to create a wrapper around an agent for repeated invocations.
   *
   * @param agent - Target agent to be wrapped for consistent invocation
   * @returns A user agent instance that provides a convenient interface for interacting with the target agent
   *
   * @example
   * Here's an example of how to create a user agent and invoke it consistently:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-user-agent}
   */
  invoke<I extends Message, O extends Message>(agent: Agent<I, O>): UserAgent<I, O>;

  /**
   * Invokes an agent with a message and returns both the output and the active agent.
   * This overload is useful when you need to track which agent was ultimately responsible for generating the response.
   *
   * @param agent - Target agent to invoke
   * @param message - Input message to send to the agent
   * @param options.returnActiveAgent - Must be true to return the final active agent
   * @param options.streaming - Must be false to return a response stream
   * @returns A promise resolving to a tuple containing the agent's response and the final active agent
   */
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I,
    options: InvokeOptions<U> & { returnActiveAgent: true; streaming?: false },
  ): Promise<[O, Agent]>;

  /**
   * Invokes an agent with a message and returns both a stream of the response and the active agent.
   * This overload is useful when you need streaming responses while also tracking which agent provided them.
   *
   * @param agent - Target agent to invoke
   * @param message - Input message to send to the agent
   * @param options.returnActiveAgent - Must be true to return the final active agent
   * @param options.streaming - Must be true to return a response stream
   * @returns A promise resolving to a tuple containing the agent's response stream and a promise for the final agent
   */
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I,
    options: InvokeOptions<U> & { returnActiveAgent: true; streaming: true },
  ): Promise<[AgentResponseStream<O>, Promise<Agent>]>;

  /**
   * Invokes an agent with a message and returns just the output.
   * This is the standard way to invoke an agent when you only need the response.
   *
   * @param agent - Target agent to invoke
   * @param message - Input message to send to the agent
   * @param options - Optional configuration parameters for the invocation
   * @returns A promise resolving to the agent's complete response
   *
   * @example
   * Here's a simple example of how to invoke an agent:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-simple}
   */
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I,
    options?: InvokeOptions<U> & { returnActiveAgent?: false; streaming?: false },
  ): Promise<O>;

  /**
   * Invokes an agent with a message and returns a stream of the response.
   * This allows processing the response incrementally as it's being generated.
   *
   * @param agent - Target agent to invoke
   * @param message - Input message to send to the agent
   * @param options - Configuration with streaming enabled to receive incremental response chunks
   * @returns A promise resolving to a stream of the agent's response that can be consumed incrementally
   *
   * @example
   * Here's an example of how to invoke an agent with streaming response:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-streaming}
   */
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message: I,
    options: InvokeOptions<U> & { returnActiveAgent?: false; streaming: true },
  ): Promise<AgentResponseStream<O>>;

  /**
   * General implementation signature that handles all overload cases.
   * This unified signature supports all the different invocation patterns defined by the overloads.
   *
   * @param agent - Target agent to invoke or wrap
   * @param message - Optional input message to send to the agent
   * @param options - Optional configuration parameters for the invocation
   * @returns Either a UserAgent (when no message provided) or a promise resolving to the agent's response
   * with optional active agent information based on the provided options
   */
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message?: I,
    options?: InvokeOptions<U>,
  ): UserAgent<I, O> | Promise<AgentResponse<O> | [AgentResponse<O>, Agent]>;

  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O>,
    message?: I,
    options?: InvokeOptions<U>,
  ): UserAgent<I, O> | Promise<AgentResponse<O> | [AgentResponse<O>, Agent]> {
    this.observer?.serve();
    const context = new AIGNEContext(this);
    return context.invoke(agent, message, options);
  }

  /**
   * Publishes a message to the message queue for inter-agent communication.
   * This method broadcasts a message to all subscribers of the specified topic(s).
   * It creates a new context internally and delegates to the context's publish method.
   *
   * @param topic - The topic or array of topics to publish the message to
   * @param payload - The message payload to be delivered to subscribers
   * @param options - Optional configuration parameters for the publish operation
   *
   * @example
   * Here's an example of how to publish a message:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-publish-message}
   */
  publish(
    topic: string | string[],
    payload: Omit<MessagePayload, "context"> | Message,
    options?: InvokeOptions<U>,
  ) {
    this.observer?.serve();
    return new AIGNEContext(this).publish(topic, payload, options);
  }

  /**
   * Subscribes to receive the next message on a specific topic.
   * This overload returns a Promise that resolves with the next message published to the topic.
   * It's useful for one-time message handling or when using async/await patterns.
   *
   * @param topic - The topic to subscribe to
   * @returns A Promise that resolves with the next message payload published to the specified topic
   *
   * @example
   * Here's an example of how to subscribe to a topic and receive the next message:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-publish-message}
   */
  subscribe(topic: string | string[], listener?: undefined): Promise<MessagePayload>;

  /**
   * Subscribes to messages on a specific topic with a listener callback.
   * This overload registers a listener function that will be called for each message published to the topic.
   * It's useful for continuous message handling or event-driven architectures.
   *
   * @param topic - The topic to subscribe to
   * @param listener - Callback function that will be invoked when messages arrive on the specified topic
   * @returns An Unsubscribe function that can be called to cancel the subscription
   *
   * @example
   * Here's an example of how to subscribe to a topic with a listener:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-subscribe-topic}
   */
  subscribe(topic: string | string[], listener: MessageQueueListener): Unsubscribe;

  /**
   * Generic subscribe signature that handles both Promise and listener patterns.
   * This is the implementation signature that supports both overloaded behaviors.
   *
   * @param topic - The topic to subscribe to
   * @param listener - Optional callback function
   * @returns Either a Promise for the next message or an Unsubscribe function
   */
  subscribe(
    topic: string | string[],
    listener?: MessageQueueListener,
  ): Unsubscribe | Promise<MessagePayload>;
  subscribe(
    topic: string | string[],
    listener?: MessageQueueListener,
  ): Unsubscribe | Promise<MessagePayload> {
    return this.messageQueue.subscribe(topic, listener);
  }

  /**
   * Unsubscribes a listener from a specific topic in the message queue.
   * This method stops a previously registered listener from receiving further messages.
   * It should be called when message processing is complete or when the component is no longer interested
   * in messages published to the specified topic.
   *
   * @param topic - The topic to unsubscribe from
   * @param listener - The listener function that was previously subscribed to the topic
   *
   * @example
   * {@includeCode ../../test/aigne/aigne.test.ts#example-subscribe-topic}
   */
  unsubscribe(topic: string | string[], listener: MessageQueueListener) {
    this.messageQueue.unsubscribe(topic, listener);
  }

  /**
   * Gracefully shuts down the AIGNE instance and all its agents and skills.
   * This ensures proper cleanup of resources before termination.
   *
   * @returns A promise that resolves when shutdown is complete.
   *
   * @example
   * Here's an example of shutdown an AIGNE instance:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-shutdown}
   */
  async shutdown() {
    for (const tool of this.skills) {
      await tool.shutdown();
    }
    for (const agent of this.agents) {
      await agent.shutdown();
    }
  }

  /**
   * Asynchronous dispose method for the AIGNE instance.
   *
   * @example
   * Here's an example of using async dispose:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-shutdown-using}
   */
  async [Symbol.asyncDispose]() {
    await this.shutdown();
  }

  /**
   * Initializes handlers for process exit events to ensure clean shutdown.
   * This registers handlers for SIGINT and exit events to properly terminate all agents.
   */
  private initProcessExitHandler() {
    const shutdownAndExit = () => this.shutdown().finally(() => process.exit(0));
    process.on("SIGINT", shutdownAndExit);
    process.on("exit", shutdownAndExit);
  }
}

const aigneOptionsSchema = z.object({
  model: z.instanceof(ChatModel).optional(),
  skills: z.array(z.instanceof(Agent)).optional(),
  agents: z.array(z.instanceof(Agent)).optional(),
  observer: z.instanceof(AIGNEObserver).optional(),
});

const aigneAddAgentArgsSchema = z.array(z.instanceof(Agent));
