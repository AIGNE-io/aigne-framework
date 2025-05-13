/**
 * Client module used to interact with the AIGNE framework.
 */

import type {
  AgentInvokeOptions,
  AgentResponse,
  AgentResponseChunk,
  AgentResponseStream,
  Message,
} from "../agents/agent.js";
import { AgentResponseStreamParser, EventStreamParser } from "../utils/event-stream.js";
import { tryOrThrow } from "../utils/type-utils.js";

/**
 * Configuration options for the AIGNEClient.
 */
export interface AIGNEClientOptions {
  /**
   * The URL of the AIGNE server to connect to.
   * This should point to the base endpoint where the AIGNEServer is hosted.
   */
  url: string;
}

/**
 * Options for invoking an agent through the AIGNEClient.
 * Extends the standard AgentInvokeOptions with client-specific options.
 */
export interface AIGNEClientInvokeOptions extends AgentInvokeOptions {
  /**
   * Additional fetch API options to customize the HTTP request.
   * These options will be merged with the default options used by the client.
   */
  fetchOptions?: Partial<RequestInit>;
}

/**
 * Client for interacting with a remote AIGNE server.
 * AIGNEClient provides a client-side interface that matches the AIGNE API,
 * allowing applications to invoke agents and receive responses from a remote AIGNE instance.
 *
 * @example
 * Here's a simple example of how to use AIGNEClient:
 * {@includeCode ../../test/client/client.test.ts#example-aigne-client-simple}
 *
 * @example
 * Here's an example of how to use AIGNEClient with streaming response:
 * {@includeCode ../../test/client/client.test.ts#example-aigne-client-streaming}
 */
export class AIGNEClient {
  /**
   * Creates a new AIGNEClient instance.
   *
   * @param options - Configuration options for connecting to the AIGNE server
   */
  constructor(public options: AIGNEClientOptions) {}

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
   * {@includeCode ../../test/client/client.test.ts#example-aigne-client-simple}
   */
  async invoke<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options?: AIGNEClientInvokeOptions & { streaming?: false },
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
   * {@includeCode ../../test/client/client.test.ts#example-aigne-client-streaming}
   */
  async invoke<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options: AIGNEClientInvokeOptions & { streaming: true },
  ): Promise<AgentResponseStream<O>>;

  /**
   * Invokes an agent with the given input and options.
   *
   * @param agent - Name of the agent to invoke
   * @param input - Input message for the agent
   * @param options - Options for the invocation
   * @returns Either a complete response or a response stream depending on the streaming option
   */
  async invoke<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options?: AIGNEClientInvokeOptions,
  ): Promise<AgentResponse<O>>;
  async invoke<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options?: AIGNEClientInvokeOptions,
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
}
