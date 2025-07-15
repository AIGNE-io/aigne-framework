import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  type AgentResponse,
  type AgentResponseChunk,
  type AgentResponseStream,
  ChatModel,
  type ChatModelInput,
  type ChatModelOptions,
  type ChatModelOutput,
  type InvokeOptions,
  type Message,
} from "@aigne/core";
import { AgentResponseStreamParser, EventStreamParser } from "@aigne/core/utils/event-stream.js";
import {
  checkArguments,
  omit,
  type PromiseOrValue,
  tryOrThrow,
} from "@aigne/core/utils/type-utils.js";
import { z } from "zod";

export interface ClientChatModelOptions {
  url: string;
  accessKeyId?: string;
  model?: string;
  modelOptions?: ChatModelOptions;
}

export interface ClientChatModelInvokeOptions extends InvokeOptions {
  /**
   * Additional fetch API options to customize the HTTP request.
   * These options will be merged with the default options used by the client.
   */
  fetchOptions?: Partial<RequestInit>;
}

/**
 * @hidden
 */
export const ClientChatModelOptionsSchema = z.object({
  url: z.string(),
  accessKeyId: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z
    .object({
      model: z.string().optional(),
      temperature: z.number().optional(),
      topP: z.number().optional(),
      frequencyPenalty: z.number().optional(),
      presencePenalty: z.number().optional(),
      parallelToolCalls: z.boolean().optional().default(true),
    })
    .optional(),
});

export class ClientChatBaseModel extends ChatModel {
  constructor(public options: ClientChatModelOptions) {
    if (options) checkArguments("ClientChatModel", ClientChatModelOptionsSchema, options);
    super();
  }

  process(
    _input: ChatModelInput,
    _options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
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
  async __invoke<I extends Message, O extends Message>(
    agent: string,
    input: string | I,
    options?: ClientChatModelInvokeOptions & { streaming?: false },
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
    agent: string,
    input: string | I,
    options: ClientChatModelInvokeOptions & { streaming: true },
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
    agent: string,
    input: string | I,
    options?: ClientChatModelInvokeOptions,
  ): Promise<AgentResponse<O>>;
  async __invoke<I extends Message, O extends Message>(
    agent: string,
    input: string | I,
    options?: ClientChatModelInvokeOptions,
  ): Promise<AgentResponse<O>> {
    const headers: any = {
      "Content-Type": "application/json",
      ...options?.fetchOptions?.headers,
    };

    if (this.options.accessKeyId) {
      headers["Authorization"] = `Bearer ${this.options.accessKeyId}`;
    }

    const response = await this.fetch(this.options.url, {
      ...options?.fetchOptions,
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        agent,
        input: typeof input === "string" ? input : { model: this.options.model, ...input },
        options: options && {
          ...omit(options, "context" as any),
          userContext: { ...options.userContext },
          memories: [...(options.memories ?? [])],
        },
      }),
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
