import { z } from "zod";
import { Agent } from "../agents/agent.js";
import { load } from "../loader/index.js";
import { ChatModel } from "../models/chat-model.js";
import { checkArguments, createAccessorArray } from "../utils/type-utils.js";
import { AIGNEContext, type Context } from "./context.js";
import { MessageQueue } from "./message-queue.js";
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
export class AIGNE {
  /**
   * Loads an AIGNE instance from a directory containing an aigne.yaml file and agent definitions.
   * This static method provides a convenient way to initialize an AIGNE system from configuration files.
   *
   * @param path - Path to the directory containing the aigne.yaml file.
   * @param options - Options to override the loaded configuration.
   * @returns A fully initialized AIGNE instance with configured agents and skills.
   */
  static async load(path: string, options?: AIGNEOptions): Promise<AIGNE> {
    const { model, agents, skills, ...aigne } = await load({ path });
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
  newContext() {
    return new AIGNEContext(this);
  }

  /**
   * Invokes an agent with the specified input and options.
   * This is a shorthand method that creates a new context and immediately invokes an agent.
   *
   * @param args - Arguments passed to the Context's invoke method.
   * @returns The result of the agent invocation.
   *
   * @example
   * Here's a simple example of how to invoke an agent:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-simple}
   *
   * @example
   * Here's an example of how to invoke an agent with streaming response:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-streaming}
   */
  invoke = ((...args: Parameters<Context["invoke"]>) => {
    return new AIGNEContext(this).invoke(...args);
  }) as Context["invoke"];

  /**
   * Publishes a message to the message queue.
   * This is a shorthand method that creates a new context and publishes a message.
   *
   * @param args - Arguments passed to the Context's publish method.
   * @returns The result of the publish operation.
   */
  publish = ((...args) => {
    return new AIGNEContext(this).publish(...args);
  }) as Context["publish"];

  /**
   * Subscribes to messages in the message queue.
   * This allows for receiving messages from agents and other components.
   *
   * @param args - Arguments passed to the MessageQueue's subscribe method.
   * @returns A subscription that can be used to unsubscribe.
   */
  subscribe = ((...args) => {
    return this.messageQueue.subscribe(...args);
  }) as Context["subscribe"];

  /**
   * Unsubscribes from messages in the message queue.
   * This cancels a previous subscription to stop receiving messages.
   *
   * @param args - Arguments passed to the MessageQueue's unsubscribe method.
   */
  unsubscribe = ((...args) => {
    this.messageQueue.unsubscribe(...args);
  }) as Context["unsubscribe"];

  /**
   * Gracefully shuts down the AIGNE instance and all its agents and skills.
   * This ensures proper cleanup of resources before termination.
   *
   * @returns A promise that resolves when shutdown is complete.
   *
   * @example
   * Here's an example of shutdown an AIGNE instance:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-shutdown}
   *
   * @example
   * Here's an example of using async dispose:
   * {@includeCode ../../test/aigne/aigne.test.ts#example-shutdown-using}
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
});

const aigneAddAgentArgsSchema = z.array(z.instanceof(Agent));
