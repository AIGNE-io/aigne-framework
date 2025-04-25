import type {
  AgentCallOptions,
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

export class AIGNEClient {
  constructor(public options: AIGNEClientOptions) {}

  async call<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options: AgentCallOptions & { streaming: true },
  ): Promise<AgentResponseStream<O>>;
  async call<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options?: AgentCallOptions & { streaming?: false },
  ): Promise<O>;
  async call<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options?: AgentCallOptions,
  ): Promise<AgentResponse<O>>;
  async call<I extends Message, O extends Message>(
    agent: string,
    input: I,
    options?: AgentCallOptions,
  ): Promise<AgentResponse<O>> {
    const response = await this.fetch(this.options.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
