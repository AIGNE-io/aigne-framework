import {
  type RunOptions,
  Runnable,
  type RunnableDefinition,
  type RunnableResponse,
  type RunnableResponseStream,
} from "@aigne/core";
import { joinURL } from "ufo";

import { fetchApi } from "./api/api";
import type { AIGNERuntime } from "./runtime";
import { EventSourceParserStream, RunnableStreamParser } from "./utils/event-stream";

export class Agent<I extends {} = {}, O extends {} = {}> extends Runnable<I, O> {
  constructor(
    private runtime: AIGNERuntime,
    definition: RunnableDefinition,
  ) {
    super(definition);
  }

  async run(input: I, options: RunOptions & { stream: true }): Promise<RunnableResponseStream<O>>;
  async run(input: I, options?: RunOptions & { stream?: boolean }): Promise<O>;
  async run(input: I, options?: RunOptions): Promise<RunnableResponse<O>> {
    const url = joinURL("/api/aigne", this.runtime.id, "agents", this.id, "run");
    const body = { input, options };

    const result = await fetchApi(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!options?.stream) {
      return (await result.json()) as O;
    }

    if (!result.body) throw new Error("No response body");

    return result.body
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new EventSourceParserStream())
      .pipeThrough(new RunnableStreamParser());
  }
}
