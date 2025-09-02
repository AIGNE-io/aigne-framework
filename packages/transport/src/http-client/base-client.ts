import type {
  AgentResponse,
  AgentResponseChunk,
  AgentResponseStream,
  InvokeOptions,
  Message,
} from "@aigne/core";
import { AgentResponseStreamParser, EventStreamParser } from "@aigne/core/utils/event-stream.js";
import { logger } from "@aigne/core/utils/logger.js";
import { pick, tryOrThrow } from "@aigne/core/utils/type-utils.js";
import { ChatModelName } from "../constants.js";

const DEFAULT_MAX_RECONNECTS = 3;

/**
 * Options for invoking an agent through the BaseClient.
 * Extends the standard AgentInvokeOptions with client-specific options.
 */
export interface BaseClientInvokeOptions extends InvokeOptions {
  /**
   * Additional fetch API options to customize the HTTP request.
   * These options will be merged with the default options used by the client.
   */
  fetchOptions?: Partial<RequestInit> & {
    maxRetries?: number;
  };
}

export interface BaseClientOptions {
  url: string;
  apiKey?: string;
}

/**
 * Http client for interacting with a remote AIGNE server.
 * BaseClient provides a client-side interface that matches the AIGNE API,
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
export class BaseClient {
  /**
   * Creates a new AIGNEClient instance.
   *
   * @param options - Configuration options for connecting to the AIGNE server
   */
  constructor(public options: BaseClientOptions) {}

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
  async __invoke<I extends Message, O extends Message>(
    agent?: string,
    input?: string | I,
    options?: BaseClientInvokeOptions & { streaming?: false },
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
  async __invoke<I extends Message, O extends Message>(
    agent?: string,
    input?: string | I,
    options?: BaseClientInvokeOptions & { streaming: true },
  ): Promise<AgentResponseStream<O>>;

  /**
   * Invokes an agent with the given input and options.
   *
   * @param agent - Name of the agent to invoke
   * @param input - Input message for the agent
   * @param options - Options for the invocation
   * @returns Either a complete response or a response stream depending on the streaming option
   */
  async __invoke<I extends Message, O extends Message>(
    agent?: string,
    input?: string | I,
    options?: BaseClientInvokeOptions,
  ): Promise<AgentResponse<O>>;
  async __invoke<I extends Message, O extends Message>(
    agent?: string,
    input?: string | I,
    options?: BaseClientInvokeOptions,
  ): Promise<AgentResponse<O>> {
    const headers: Record<string, any> = {
      "Content-Type": "application/json",
      ...options?.fetchOptions?.headers,
    };

    if (this.options?.apiKey) {
      headers["Authorization"] = `Bearer ${this.options.apiKey}`;
    }

    const body: Record<string, any> = {
      input,
      agent: agent ?? ChatModelName,
      options:
        options &&
        pick(
          {
            ...options,
            userContext: { ...options.userContext },
            memories: [...(options.memories ?? [])],
          },
          ["returnProgressChunks", "userContext", "memories", "streaming"],
        ),
    };

    const response = await this.fetch(this.options.url, {
      ...options?.fetchOptions,
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
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
  async fetch(url: string, init?: BaseClientInvokeOptions["fetchOptions"]): Promise<Response> {
    const { default: retry } = await import("p-retry");

    const result = await retry(() => globalThis.fetch(url, init), {
      retries: init?.maxRetries ?? DEFAULT_MAX_RECONNECTS,
      onFailedAttempt: (error) => {
        logger.warn("Retrying fetch request due to error:", error);
      },
    });

    if (!result.ok) {
      let message: string | undefined;
      let resultText: string | undefined;
      let type: string | undefined;

      try {
        const text = await result.text();
        const json = tryOrThrow(
          () => JSON.parse(text) as { error?: { message: string; type?: string } },
        );
        resultText = text;
        message = json?.error?.message;
        type = json?.error?.type;
      } catch {
        // ignore
      }

      if (message) {
        const e = new Error(message);
        if (type) (e as any).type = type;
        throw e;
      }

      throw new Error(`Failed to fetch url ${url} with status ${result.status}: ${resultText}`);
    }

    return result;
  }
}
