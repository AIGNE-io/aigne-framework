import { ServerResponse } from "node:http";
import { z } from "zod";
import type {} from "../agents/agent.js";
import type { ExecutionEngine } from "../execution-engine/execution-engine.js";
import { AgentResponseStreamSSE } from "../utils/event-stream.js";
import { readableStreamToAsyncIterator } from "../utils/stream-utils.js";
import { checkArguments, tryOrThrow } from "../utils/type-utils.js";
import { HttpError } from "./error.js";

export const callPayloadSchema = z.object({
  agent: z.string(),
  input: z.record(z.string(), z.unknown()),
  options: z
    .object({
      streaming: z.boolean().nullish(),
    })
    .nullish(),
});

export class AIGNEServer {
  constructor(public engine: ExecutionEngine) {}

  async call(payload: Record<string, unknown>): Promise<Response>;
  async call(payload: Record<string, unknown>, res: ServerResponse): Promise<void>;
  async call(payload: Record<string, unknown>, res?: ServerResponse): Promise<Response | void> {
    const response = await this._call(payload);

    if (res instanceof ServerResponse) {
      await this._writeResponse(response, res);
      return;
    }

    return response;
  }

  async _call(payload: Record<string, unknown>): Promise<Response> {
    const { engine } = this;

    try {
      const {
        agent: agentName,
        input,
        options,
      } = tryOrThrow(
        () => checkArguments(`Call agent ${payload.agent}`, callPayloadSchema, payload),
        (error) => new HttpError(400, error.message),
      );

      const agent = engine.agents[agentName];
      if (!agent) throw new HttpError(404, `Agent ${agentName} not found`);

      if (!options?.streaming) {
        const result = await engine.call(agent, input);
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      }

      const stream = await engine.call(agent, input, { streaming: true });

      return new Response(new AgentResponseStreamSSE(stream), {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: { message: error.message } }), {
        status: error instanceof HttpError ? error.status : 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  async _writeResponse(response: Response, res: ServerResponse): Promise<void> {
    try {
      res.writeHead(response.status, response.headers.toJSON());

      if (!response.body) throw new Error("Response body is empty");

      for await (const chunk of readableStreamToAsyncIterator(response.body)) {
        res.write(chunk);
      }
    } catch (error) {
      if (!res.headersSent) {
        res.writeHead(error instanceof HttpError ? error.status : 500, {
          "Content-Type": "application/json",
        });
      }
      if (res.writable) {
        res.write(JSON.stringify({ error: { message: error.message } }));
      }
    } finally {
      res.end();
    }
  }
}
