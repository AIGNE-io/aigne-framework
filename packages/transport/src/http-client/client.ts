import {
  type Agent,
  type AgentResponse,
  type AgentResponseChunk,
  type AgentResponseStream,
  type Context,
  type ContextEmitEventMap,
  type ContextEventMap,
  type ContextUsage,
  type InvokeOptions,
  type Message,
  type MessagePayload,
  type MessageQueueListener,
  type Unsubscribe,
  type UserAgent,
  type UserContext,
  newEmptyContextUsage,
} from "@aigne/core";
import { AgentResponseStreamParser, EventStreamParser } from "@aigne/core/utils/event-stream.js";
import { tryOrThrow } from "@aigne/core/utils/type-utils.js";
import type { Args, Listener } from "@aigne/core/utils/typed-event-emtter.js";
import { v7 } from "uuid";
import { ClientAgent, type ClientAgentOptions } from "./client-agent.js";

/**
 * Configuration options for the AIGNEHTTPClient.
 */
export interface AIGNEHTTPClientOptions {
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
export interface AIGNEHTTPClientInvokeOptions extends InvokeOptions {
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
  /**
   * Creates a new AIGNEClient instance.
   *
   * @param options - Configuration options for connecting to the AIGNE server
   */
  constructor(public options: AIGNEHTTPClientOptions) {}

  id = v7();

  rootId = this.id;

  usage: ContextUsage = newEmptyContextUsage();

  userContext: U = {} as U;

  memories: Context["memories"] = [];

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

    const a =
      typeof agent === "string" ? this.getAgent<I, O>({ name: agent }) : Promise.resolve(agent);

    return a.then((agent) => agent.invoke(message, options));
  }

  publish(
    _topic: string | string[],
    _payload: Omit<MessagePayload, "context"> | Message | string,
    _options?: InvokeOptions,
  ): void {
    throw new Error("Method not implemented.");
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
    throw new Error("Method not implemented.");
  }

  unsubscribe(_topic: string | string[], _listener: MessageQueueListener): void {
    throw new Error("Method not implemented.");
  }

  newContext(_options?: { reset?: boolean }): Context {
    throw new Error("Method not implemented.");
  }

  emit<K extends keyof ContextEventMap>(
    _eventName: K,
    ..._args: Args<K, ContextEmitEventMap>
  ): boolean {
    throw new Error("Method not implemented.");
  }

  on<K extends keyof ContextEventMap>(
    _eventName: K,
    _listener: Listener<K, ContextEventMap>,
  ): this {
    throw new Error("Method not implemented.");
  }

  once<K extends keyof ContextEventMap>(
    _eventName: K,
    _listener: Listener<K, ContextEventMap>,
  ): this {
    throw new Error("Method not implemented.");
  }

  off<K extends keyof ContextEventMap>(
    _eventName: K,
    _listener: Listener<K, ContextEventMap>,
  ): this {
    throw new Error("Method not implemented.");
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
    // Send the agent invocation request to the AIGNE server
    const response = await this.fetch(this.options.url, {
      ...options?.fetchOptions,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.fetchOptions?.headers,
      },
      body: JSON.stringify({ agent, input, options }),
    });

    // For non-streaming responses, simply parse the JSON response and return it
    if (!options?.streaming) {
      return await response.json();
    }

    // For streaming responses, set up the streaming pipeline
    const stream = response.body;
    if (!stream) throw new Error("Response body is not a stream");

    // Process the stream through a series of transforms:
    // 1. Convert bytes to text
    // 2. Parse SSE format into structured events
    // 3. Convert events into a standardized agent response stream
    return stream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventStreamParser<AgentResponseChunk<O>>())
      .pipeThrough(new AgentResponseStreamParser());
  }

  /**
   * Enhanced fetch method that handles error responses from the AIGNE server.
   * This method wraps the standard fetch API to provide better error handling and reporting.
   *
   * @param args - Standard fetch API arguments (url and options)
   * @returns A Response object if the request was successful
   * @throws Error with detailed information if the request failed
   *
   * @private
   */
  async fetch(...args: Parameters<typeof globalThis.fetch>): Promise<Response> {
    const result = await globalThis.fetch(...args);

    if (!result.ok) {
      let message: string | undefined;

      try {
        const text = await result.text();
        const json = tryOrThrow(() => JSON.parse(text) as { error?: { message: string } });
        message = json?.error?.message || text;
      } catch {
        // ignore
      }

      throw new Error(`Failed to fetch url ${args[0]} with status ${result.status}: ${message}`);
    }

    return result;
  }

  async getAgent<I extends Message = Message, O extends Message = Message>(
    options: ClientAgentOptions<I, O>,
  ): Promise<ClientAgent<I, O>> {
    return new ClientAgent(this, options);
  }
}
