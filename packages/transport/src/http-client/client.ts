import {
  AIGNEHubBaseModel,
  type AIGNEHubChatModelInvokeOptions,
  type AIGNEHubChatModelOptions,
} from "@aigne/aigne-hub";
import {
  type Agent,
  type AgentResponse,
  type AgentResponseStream,
  type Context,
  type ContextEmitEventMap,
  type ContextEventMap,
  type ContextUsage,
  type InvokeOptions,
  type Message,
  type MessagePayload,
  type MessageQueueListener,
  newEmptyContextUsage,
  type Unsubscribe,
  type UserAgent,
  type UserContext,
} from "@aigne/core";
import { omit } from "@aigne/core/utils/type-utils.js";
import type { Args, Listener } from "@aigne/core/utils/typed-event-emitter.js";
import { v7 } from "uuid";
import { ClientAgent, type ClientAgentOptions } from "./client-agent.js";
import { ClientChatModel } from "./client-chat-model.js";

/**
 * Configuration options for the AIGNEHTTPClient.
 */
export interface AIGNEHTTPClientOptions extends AIGNEHubChatModelOptions {
  /**
   * The URL of the AIGNE server to connect to.
   * This should point to the base endpoint where the AIGNEServer is hosted.
   */
  url: string;
}

/**
 * Options for invoking an agent through the AIGNEHTTPClient.
 * Extends the standard AgentInvokeOptions with client-specific options.
 */
export interface AIGNEHTTPClientInvokeOptions extends AIGNEHubChatModelInvokeOptions {
  /**
   * Additional fetch API options to customize the HTTP request.
   * These options will be merged with the default options used by the client.
   */
  fetchOptions?: Partial<RequestInit>;
}

/**
 * Http client for interacting with a remote AIGNE server.
 * AIGNEHTTPClient provides a client-side interface that matches the AIGNE API,
 * allowing applications to invoke agents and receive responses from a remote AIGNE instance.
 *
 * @example
 * Here's a simple example of how to use AIGNEClient:
 * {@includeCode ../../test/http-client/http-client.test.ts#example-aigne-client-simple}
 *
 * @example
 * Here's an example of how to use AIGNEClient with streaming response:
 * {@includeCode ../../test/http-client/http-client.test.ts#example-aigne-client-streaming}
 */
export class AIGNEHTTPClient<U extends UserContext = UserContext> implements Context<U> {
  private _baseModel: AIGNEHubBaseModel;

  /**
   * Creates a new AIGNEClient instance.
   *
   * @param options - Configuration options for connecting to the AIGNE server
   */
  constructor(public options: AIGNEHTTPClientOptions) {
    this._baseModel = new AIGNEHubBaseModel(options);
  }

  id = v7();

  rootId = this.id;

  usage: ContextUsage = newEmptyContextUsage();

  userContext: U = {} as U;

  memories: Context["memories"] = [];

  model = new ClientChatModel(this);

  invoke<I extends Message, O extends Message>(agent: Agent<I, O> | string): UserAgent<I, O>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O> | string,
    message: I,
    options: AIGNEHTTPClientInvokeOptions & { returnActiveAgent: true; streaming?: false },
  ): Promise<[O, Agent]>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O> | string,
    message: I,
    options: AIGNEHTTPClientInvokeOptions & { returnActiveAgent: true; streaming: true },
  ): Promise<[AgentResponseStream<O>, Promise<Agent>]>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O> | string,
    message: I,
    options?: AIGNEHTTPClientInvokeOptions & { returnActiveAgent?: false; streaming?: false },
  ): Promise<O>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O> | string,
    message: I,
    options: AIGNEHTTPClientInvokeOptions & { returnActiveAgent?: false; streaming: true },
  ): Promise<AgentResponseStream<O>>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O> | string,
    message: I,
    options: AIGNEHTTPClientInvokeOptions & { returnActiveAgent?: false },
  ): Promise<O | AgentResponseStream<O>>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O> | string,
    message?: I,
    options?: AIGNEHTTPClientInvokeOptions,
  ): UserAgent<I, O> | Promise<AgentResponse<O> | [AgentResponse<O>, Agent]>;
  invoke<I extends Message, O extends Message>(
    agent: Agent<I, O> | string,
    message?: I,
    options?: AIGNEHTTPClientInvokeOptions,
  ): UserAgent<I, O> | Promise<AgentResponse<O> | [AgentResponse<O>, Agent]> {
    if (options?.returnActiveAgent) throw new Error("Method not implemented.");
    if (!message) throw new Error("Message is required for invoking an agent");

    if (options?.userContext) {
      Object.assign(this.userContext, options.userContext);
      options.userContext = undefined;
    }
    if (options?.memories?.length) {
      this.memories.push(...options.memories);
      options.memories = undefined;
    }

    const a =
      typeof agent === "string" ? this.getAgent<I, O>({ name: agent }) : Promise.resolve(agent);

    return a.then((agent) => agent.invoke(message, { ...options, context: this }));
  }

  publish(
    _topic: string | string[],
    _payload: Omit<MessagePayload, "context"> | Message | string,
    _options?: InvokeOptions,
  ): void {
    console.error("Method not implemented.");
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
  ): Unsubscribe | Promise<MessagePayload>;
  subscribe(
    _topic: string | string[],
    _listener?: MessageQueueListener,
  ): Unsubscribe | Promise<MessagePayload> {
    console.error("Method not implemented.");
    return () => {};
  }

  unsubscribe(_topic: string | string[], _listener: MessageQueueListener): void {
    console.error("Method not implemented.");
  }

  newContext(_options?: { reset?: boolean }): Context {
    throw new Error("Method not implemented.");
  }

  emit<K extends keyof ContextEventMap>(
    _eventName: K,
    ..._args: Args<K, ContextEmitEventMap>
  ): boolean {
    console.error("Method not implemented.");
    return false;
  }

  on<K extends keyof ContextEventMap>(
    _eventName: K,
    _listener: Listener<K, ContextEventMap>,
  ): this {
    console.error("Method not implemented.");
    return this;
  }

  once<K extends keyof ContextEventMap>(
    _eventName: K,
    _listener: Listener<K, ContextEventMap>,
  ): this {
    console.error("Method not implemented.");
    return this;
  }

  off<K extends keyof ContextEventMap>(
    _eventName: K,
    _listener: Listener<K, ContextEventMap>,
  ): this {
    console.error("Method not implemented.");
    return this;
  }

  /**
   * Invokes an agent in non-streaming mode and returns the complete response.
   *
   * @param agent - Name of the agent to invoke
   * @param input - Input message for the agent
   * @param options - Options with streaming mode explicitly set to false or omitted
   * @returns The complete agent response
   *
   * @example
   * Here's a simple example of how to use AIGNEClient:
   * {@includeCode ../../test/http-client/http-client.test.ts#example-aigne-client-simple}
   */
  async _invoke<I extends Message, O extends Message>(
    agent: string,
    input: string | I,
    options?: AIGNEHTTPClientInvokeOptions & { streaming?: false },
  ): Promise<O>;

  /**
   * Invokes an agent with streaming mode enabled and returns a stream of response chunks.
   *
   * @param agent - Name of the agent to invoke
   * @param input - Input message for the agent
   * @param options - Options with streaming mode explicitly set to true
   * @returns A stream of agent response chunks
   *
   * @example
   * Here's an example of how to use AIGNEClient with streaming response:
   * {@includeCode ../../test/http-client/http-client.test.ts#example-aigne-client-streaming}
   */
  async _invoke<I extends Message, O extends Message>(
    agent: string,
    input: string | I,
    options: AIGNEHTTPClientInvokeOptions & { streaming: true },
  ): Promise<AgentResponseStream<O>>;

  /**
   * Invokes an agent with the given input and options.
   *
   * @param agent - Name of the agent to invoke
   * @param input - Input message for the agent
   * @param options - Options for the invocation
   * @returns Either a complete response or a response stream depending on the streaming option
   */
  async _invoke<I extends Message, O extends Message>(
    agent: string,
    input: string | I,
    options?: AIGNEHTTPClientInvokeOptions,
  ): Promise<AgentResponse<O>>;
  async _invoke<I extends Message, O extends Message>(
    agent: string,
    input: string | I,
    options?: AIGNEHTTPClientInvokeOptions,
  ): Promise<AgentResponse<O>> {
    const safeOptions = options || {};

    return this._baseModel._baseInvoke(agent, input, {
      ...omit(safeOptions, "context" as any),
      userContext: { ...this.userContext, ...safeOptions.userContext },
      memories: [...this.memories, ...(safeOptions.memories ?? [])],
    });
  }

  async getAgent<I extends Message = Message, O extends Message = Message>(
    options: ClientAgentOptions<I, O>,
  ): Promise<ClientAgent<I, O>> {
    return new ClientAgent(this, options);
  }
}
