import type {
  AgentInvokeOptions,
  AgentResponse,
  AgentResponseChunk,
  AgentResponseStream,
  Message,
} from "../agents/agent.js";
import { AgentResponseStreamParser, EventStreamParser } from "../utils/event-stream.js";
import { tryOrThrow } from "../utils/type-utils.js";

export interface AIGNEClientOptions {
  url: string;
}

export interface AIGNEClientInvokeOptions extends AgentInvokeOptions {
  fetchOptions?: Partial<RequestInit>;
}

export class AIGNEClient {
  constructor(public options: AIGNEClientOptions) {}

  async invoke<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options: AIGNEClientInvokeOptions & { streaming: true },
  ): Promise<AgentResponseStream<O>>;
  async invoke<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options?: AIGNEClientInvokeOptions & { streaming?: false },
  ): Promise<O>;
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
    const response = await this.fetch(this.options.url, {
      ...options?.fetchOptions,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options?.fetchOptions?.headers,
      },
      body: JSON.stringify({ agent, input, options }),
    });

    if (!options?.streaming) {
      return await response.json();
    }

    const stream = response.body;
    if (!stream) throw new Error("Response body is not a stream");

    return stream
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventStreamParser<AgentResponseChunk<O>>())
      .pipeThrough(new AgentResponseStreamParser());
  }

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
